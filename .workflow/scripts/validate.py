#!/usr/bin/env python3
"""Read-only validator for the project-local workflow contract."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import sys

try:
    import yaml
except ImportError:  # pragma: no cover - tested by replacing the module value
    yaml = None


RUN_PATTERN = re.compile(
    r"^[0-9]{8}T[0-9]{6}Z-[a-z0-9]+(?:-[a-z0-9]+)*$"
)
EVENT_PATTERN = re.compile(
    r"^[0-9]{8}T[0-9]{6}Z-(?:plan_approval|execution_start|verification|deployment_approval|closure)\.yaml$"
)
EVIDENCE_PATTERN = re.compile(
    r"^[0-9]{8}T[0-9]{6}Z-[a-z0-9]+(?:-[a-z0-9]+)*\.md$"
)
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
COMMIT_PATTERN = re.compile(r"^[0-9a-f]{40}$")

CORE_ROOT_ENTRIES = {"README.md", "policy.yaml", "current.yaml", "templates", "scripts", "tests"}
REQUIRED_TEMPLATES = {
    "request.md", "plan.md", "state.yaml", "approval.yaml",
    "evidence.md", "result.md",
}
SUPPORTED_GATES = {
    "plan_approval", "execution_start", "verification",
    "deployment_approval", "closure",
}

POLICY_TOP_KEYS = {
    "schema_version", "contract_version", "contract_history", "project", "paths", "root_layout",
    "run", "roles", "lifecycle", "gates", "git", "deployment",
    "artifacts", "archive", "knowledge_boundary", "validation",
    "bootstrap_cleanup",
}
STATE_KEYS = {
    "schema_version", "run_id", "status", "repository", "roles",
    "scope_sha256", "plan_sha256", "approval_refs", "evidence_refs",
    "git", "deployment", "blocker", "transitions",
}
APPROVAL_KEYS = {
    "schema_version", "run_id", "gate", "decision", "by", "at",
    "scope_sha256", "artifact", "artifact_sha256", "binding",
    "conditions", "evidence", "reason",
}


class DuplicateKeyError(Exception):
    """Raised when a YAML mapping repeats a key."""


def construct_unique_mapping(loader, node, deep=False):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in result:
            raise DuplicateKeyError(f"duplicate key: {key}")
        result[key] = loader.construct_object(value_node, deep=deep)
    return result


if yaml is not None:
    class StrictSafeLoader(yaml.SafeLoader):
        pass

    StrictSafeLoader.add_constructor(
        yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
        construct_unique_mapping,
    )


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_changes_sha256(changes):
    serialized = json.dumps(changes, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def valid_utc_timestamp(value):
    if not isinstance(value, str) or not value.endswith("Z"):
        return False
    try:
        parsed = datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        return False
    return parsed.replace(tzinfo=timezone.utc).utcoffset().total_seconds() == 0


def valid_event_stamp(value):
    if not isinstance(value, str):
        return False
    try:
        datetime.strptime(value, "%Y%m%dT%H%M%SZ")
    except ValueError:
        return False
    return True


def nonempty_string(value):
    return isinstance(value, str) and bool(value.strip())


class Validator:
    def __init__(self, project):
        self.project = Path(project).resolve()
        self.workflow = self.project / ".workflow"
        self.errors = []
        self.warnings = []
        self.runs_checked = 0
        self.root_entries = set(CORE_ROOT_ENTRIES)
        self.roles = set()
        self.gates = set(SUPPORTED_GATES)
        self.initial_state = "intake"
        self.terminal_states = set()
        self.transitions = {}
        self.lifecycle_requirements = {}
        self.artifact_requirements = {}
        self.retired = []
        self.one_active = False
        self.current_pointer_required = True
        self.run_pattern = RUN_PATTERN
        self.project_policy = {}
        self.deployment_policy = {}
        self.accepted_policy_sha256 = set()

    def error(self, message):
        self.errors.append(message)

    def require_mapping(self, value, keys, label):
        if not isinstance(value, dict):
            self.error(f"{label} must be a mapping")
            return False
        unknown = set(value) - keys
        missing = keys - set(value)
        if unknown:
            self.error(f"unknown keys in {label}: {sorted(unknown)}")
        if missing:
            self.error(f"missing keys in {label}: {sorted(missing)}")
        return not unknown and not missing

    def require_type(self, value, expected, label):
        if expected is int:
            valid = type(value) is int
        elif expected is bool:
            valid = type(value) is bool
        else:
            valid = isinstance(value, expected)
        if not valid:
            self.error(f"{label} has wrong type")
        return valid

    def load_yaml(self, path):
        if yaml is None:
            self.error(
                "PyYAML is required; install it outside this read-only validator"
            )
            return None
        if path.is_symlink():
            self.error(f"YAML file must not be a symlink: {path}")
            return None
        try:
            text = path.read_text(encoding="utf-8")
            value = yaml.load(text, Loader=StrictSafeLoader)
        except (OSError, UnicodeError, yaml.YAMLError, DuplicateKeyError) as exc:
            self.error(f"invalid YAML {self.display(path)}: {exc}")
            return None
        if not isinstance(value, dict):
            self.error(f"YAML document must be a mapping: {self.display(path)}")
            return None
        return value

    def display(self, path):
        try:
            return str(path.relative_to(self.project))
        except ValueError:
            return str(path)

    def safe_run_file(self, run_path, reference, label):
        if not isinstance(reference, str) or not reference:
            self.error(f"{label} must be a non-empty relative path")
            return None
        if "\\" in reference:
            self.error(f"{label} contains a backslash: {reference}")
            return None
        pure = PurePosixPath(reference)
        if pure.is_absolute() or ".." in pure.parts or "." in pure.parts:
            self.error(f"{label} is not a safe relative path: {reference}")
            return None
        candidate = run_path.joinpath(*pure.parts)
        cursor = run_path
        for part in pure.parts:
            cursor = cursor / part
            if cursor.is_symlink():
                self.error(f"{label} must not traverse a symlink: {reference}")
                return None
        try:
            resolved = candidate.resolve(strict=True)
            run_resolved = run_path.resolve(strict=True)
            resolved.relative_to(run_resolved)
        except (OSError, ValueError):
            self.error(f"{label} is missing or escapes its run: {reference}")
            return None
        if not resolved.is_file():
            self.error(f"{label} is not a file: {reference}")
            return None
        return resolved

    def validate_contract_files(self):
        required = {"README.md", "policy.yaml", "current.yaml"}
        for name in required:
            path = self.workflow / name
            if not path.is_file() or path.is_symlink():
                self.error(f"missing or unsafe contract file: .workflow/{name}")
        for name in REQUIRED_TEMPLATES:
            path = self.workflow / "templates" / name
            if not path.is_file() or path.is_symlink():
                self.error(f"missing or unsafe template: {name}")
        for relative in ("scripts/validate.py", "tests/test_validate.py"):
            path = self.workflow / relative
            if not path.is_file() or path.is_symlink():
                self.error(f"missing or unsafe contract file: .workflow/{relative}")

        if not self.workflow.is_dir() or self.workflow.is_symlink():
            self.error(".workflow must be a real directory")
            return
        unknown = {entry.name for entry in self.workflow.iterdir()} - self.root_entries
        if unknown:
            self.error(f"unknown .workflow root entries: {sorted(unknown)}")
        for name in self.retired:
            if (self.workflow / name).exists() or (self.workflow / name).is_symlink():
                self.error(f"retired artifact must be absent: .workflow/{name}")

    def validate_policy(self):
        path = self.workflow / "policy.yaml"
        policy = self.load_yaml(path) if path.is_file() else None
        if policy is None:
            return None
        self.require_mapping(policy, POLICY_TOP_KEYS, "policy.yaml")
        if type(policy.get("schema_version")) is not int or policy.get("schema_version") != 1:
            self.error("policy.schema_version must be integer 1")
        if type(policy.get("contract_version")) is not int or policy.get("contract_version") < 1:
            self.error("policy.contract_version must be a positive integer")

        self.validate_policy_history(policy.get("contract_history"))
        self.validate_policy_project(policy.get("project"))
        self.validate_policy_paths(policy.get("paths"))
        self.validate_policy_layout(policy.get("root_layout"))
        self.validate_policy_run(policy.get("run"))
        self.validate_policy_roles(policy.get("roles"))
        self.validate_policy_lifecycle(policy.get("lifecycle"))
        self.validate_policy_gates(policy.get("gates"))
        self.validate_policy_git(policy.get("git"))
        self.validate_policy_deployment(policy.get("deployment"))
        self.validate_policy_artifacts(policy.get("artifacts"))
        self.validate_policy_archive(policy.get("archive"))
        self.validate_policy_boundary(policy.get("knowledge_boundary"))
        self.validate_policy_validation(policy.get("validation"))
        self.validate_policy_cleanup(policy.get("bootstrap_cleanup"))
        return policy

    def validate_policy_history(self, value):
        if not self.require_mapping(
            value, {"accepted_policy_sha256"}, "policy.contract_history"
        ):
            return
        digests = value.get("accepted_policy_sha256")
        if not isinstance(digests, list) or not all(
            isinstance(item, str) and SHA256_PATTERN.fullmatch(item)
            for item in digests
        ):
            self.error("policy.contract_history.accepted_policy_sha256 must contain SHA-256 values")
            return
        if len(digests) != len(set(digests)):
            self.error("policy contract history contains duplicate digests")
        self.accepted_policy_sha256 = set(digests)

    def validate_policy_project(self, value):
        keys = {
            "name", "repository_root", "environment", "default_branch",
            "authority_precedence",
        }
        if not self.require_mapping(value, keys, "policy.project"):
            return
        for key in ("name", "environment", "default_branch", "authority_precedence"):
            if not nonempty_string(value.get(key)):
                self.error(f"policy.project.{key} must be non-empty")
        if value.get("repository_root") != ".":
            self.error("policy.project.repository_root must be '.'")
        self.project_policy = value if isinstance(value, dict) else {}

    def validate_policy_paths(self, value):
        keys = {"current", "runs", "archive", "templates"}
        if not self.require_mapping(value, keys, "policy.paths"):
            return
        expected = {
            "current": ".workflow/current.yaml", "runs": ".workflow/runs",
            "archive": ".workflow/archive", "templates": ".workflow/templates",
        }
        if value != expected:
            self.error("policy.paths must contain the canonical project-relative paths")

    def validate_policy_layout(self, value):
        if not self.require_mapping(value, {"allowed_entries"}, "policy.root_layout"):
            return
        entries = value.get("allowed_entries")
        if not isinstance(entries, list) or not all(nonempty_string(item) for item in entries):
            self.error("policy.root_layout.allowed_entries must be non-empty names")
            return
        if len(entries) != len(set(entries)):
            self.error("policy.root_layout.allowed_entries contains duplicates")
        required = CORE_ROOT_ENTRIES | {"runs", "archive"}
        if not required.issubset(entries):
            self.error("policy.root_layout.allowed_entries omits required contract paths")
        self.root_entries = set(entries)

    def validate_policy_run(self, value):
        keys = {
            "one_active", "id_pattern", "immutable_ids", "overwrite",
            "project_relative_paths", "current_pointer_required",
        }
        if not self.require_mapping(value, keys, "policy.run"):
            return
        true_keys = {
            "immutable_ids", "project_relative_paths",
            "current_pointer_required",
        }
        for key in true_keys:
            if type(value.get(key)) is not bool or value.get(key) is not True:
                self.error(f"policy.run.{key} must be true")
        if type(value.get("one_active")) is not bool:
            self.error("policy.run.one_active must be boolean")
        else:
            self.one_active = value["one_active"]
        self.current_pointer_required = value.get("current_pointer_required") is True
        pattern = value.get("id_pattern")
        if not isinstance(pattern, str):
            self.error("policy.run.id_pattern must be a string")
        else:
            try:
                self.run_pattern = re.compile(pattern)
            except re.error as exc:
                self.error(f"policy.run.id_pattern is invalid: {exc}")
        if value.get("overwrite") != "forbidden":
            self.error("policy.run.overwrite must be forbidden")

    def validate_policy_roles(self, value):
        keys = {"required", "labels_are_permissions", "production_independence"}
        if not self.require_mapping(value, keys, "policy.roles"):
            return
        required = value.get("required")
        if not isinstance(required, list) or not all(nonempty_string(role) for role in required):
            self.error("policy required roles must be non-empty strings")
        else:
            if len(required) != len(set(required)):
                self.error("policy required roles contain duplicates")
            semantic_roles = {"implementer", "verifier", "release_approver"}
            if not semantic_roles.issubset(required):
                self.error("policy required roles omit production separation roles")
            self.roles = set(required)
        if value.get("labels_are_permissions") is not False:
            self.error("policy.roles.labels_are_permissions must be false")
        independence = value.get("production_independence")
        if not isinstance(independence, list) or not set(independence).issubset(self.roles):
            self.error("policy production independence is invalid")

    def validate_policy_lifecycle(self, value):
        keys = {"initial", "terminal", "transitions"}
        if not self.require_mapping(value, keys, "policy.lifecycle"):
            return
        if not nonempty_string(value.get("initial")):
            self.error("policy lifecycle initial state must be non-empty")
        else:
            self.initial_state = value["initial"]
        terminal = value.get("terminal")
        if not isinstance(terminal, list) or not all(nonempty_string(state) for state in terminal):
            self.error("policy terminal states must be non-empty strings")
        else:
            self.terminal_states = set(terminal)
        transitions = value.get("transitions")
        if not isinstance(transitions, dict):
            self.error("policy.lifecycle.transitions must be a mapping")
            return
        normalized = {}
        for state, targets in transitions.items():
            if not nonempty_string(state) or not isinstance(targets, list) or not all(
                isinstance(target, str) for target in targets
            ):
                self.error(f"policy transition list for {state} is invalid")
                continue
            normalized[state] = set(targets)
        self.transitions = normalized
        states = set(normalized)
        if self.initial_state not in states:
            self.error("policy lifecycle initial state is absent from transitions")
        if not self.terminal_states.issubset(states):
            self.error("policy terminal states are absent from transitions")
        semantic_states = {"blocked", "deployed", "closed"}
        if not semantic_states.issubset(states):
            self.error("policy lifecycle omits states required by gate semantics")
        for state, targets in normalized.items():
            unknown = targets - states - {"recorded_resume_state"}
            if unknown:
                self.error(f"policy transition list for {state} has unknown states: {sorted(unknown)}")
        self.validate_reachability()

    def validate_reachability(self):
        graph = {
            state: {target for target in targets if target != "recorded_resume_state"}
            for state, targets in self.transitions.items()
        }
        if self.initial_state not in graph:
            return
        reached = {self.initial_state}
        pending = [self.initial_state]
        while pending:
            state = pending.pop()
            for target in graph[state]:
                if target not in reached:
                    reached.add(target)
                    pending.append(target)
        if reached != set(self.transitions):
            self.error("not all lifecycle states are reachable from intake")
        if any(self.transitions.get(state) for state in self.terminal_states):
            self.error("terminal states must not have outgoing transitions")

    def validate_policy_gates(self, value):
        gate_keys = {
            "required", "immutable_events", "effective_event",
            "durable_by_history", "higher_policy_override", "plan_approval",
            "execution_start", "verification", "deployment_approval", "closure",
            "lifecycle_requirements",
        }
        if not self.require_mapping(value, gate_keys, "policy.gates"):
            return
        required = value.get("required")
        if not isinstance(required, list) or set(required) != SUPPORTED_GATES:
            self.error("policy required gates do not match contract")
        else:
            self.gates = set(required)
        expected_scalars = {
            "immutable_events": True,
            "effective_event": "latest_valid_for_gate_and_scope_digest",
            "durable_by_history": True,
            "higher_policy_override": "forbidden",
        }
        for key, expected in expected_scalars.items():
            if value.get(key) != expected or type(value.get(key)) is not type(expected):
                self.error(f"policy.gates.{key} is invalid")
        gate_shapes = {
            "plan_approval": {"requires_plan_sha256"},
            "execution_start": {
                "requires_baseline_and_matching_plan", "evidence_fields",
                "pre_existing_changes_canonical_json", "effective_policy_sha256",
            },
            "verification": {"requires_independent_verifier"},
            "deployment_approval": {
                "single_use", "requires_exact_commit_target_trigger",
            },
            "closure": {"requires_result_and_disclosed_failures"},
        }
        for gate, keys in gate_shapes.items():
            item = value.get(gate)
            if self.require_mapping(item, keys, f"policy.gates.{gate}"):
                boolean_keys = {
                    key for key in keys
                    if key.startswith("requires_") or key in {
                        "single_use", "effective_policy_sha256",
                    }
                }
                for key in boolean_keys:
                    if item.get(key) is not True:
                        self.error(f"policy.gates.{gate}.{key} must be true")
        execution = value.get("execution_start")
        if isinstance(execution, dict):
            expected_fields = [
                "repository_root", "branch", "baseline_head",
                "pre_existing_changes_sha256", "policy_sha256", "plan_sha256",
            ]
            if execution.get("evidence_fields") != expected_fields:
                self.error("policy execution_start evidence fields are invalid")
            canonical = (
                "json.dumps(value, sort_keys=True, separators=(comma, colon)), UTF-8"
            )
            if execution.get("pre_existing_changes_canonical_json") != canonical:
                self.error("policy execution_start canonical JSON rule is invalid")
        requirements = value.get("lifecycle_requirements")
        if not isinstance(requirements, dict):
            self.error("policy gate lifecycle requirements must be a mapping")
        else:
            normalized = {}
            for state, gates in requirements.items():
                if state not in self.transitions or not isinstance(gates, list) or not set(gates).issubset(self.gates):
                    self.error(f"policy gate lifecycle requirements for {state} are invalid")
                    continue
                normalized[state] = list(gates)
            self.lifecycle_requirements = normalized
            if "deployment_approval" not in normalized.get("deployed", []):
                self.error("deployed state must require deployment_approval")
            if "closure" not in normalized.get("closed", []):
                self.error("closed state must require closure")

    def validate_policy_git(self, value):
        keys = {
            "preserve_branch", "preserve_unrelated_changes", "allow_reset_hard",
            "allow_clean_fdx", "allow_stash", "commit", "push",
        }
        if not self.require_mapping(value, keys, "policy.git"):
            return
        expected_bools = {
            "preserve_branch": True, "preserve_unrelated_changes": True,
            "allow_reset_hard": False, "allow_clean_fdx": False,
            "allow_stash": False,
        }
        for key, expected in expected_bools.items():
            if value.get(key) is not expected:
                self.error(f"policy.git.{key} is invalid")
        commit = value.get("commit")
        if self.require_mapping(
            commit, {"default", "requires_explicit_run_approval"},
            "policy.git.commit",
        ):
            if commit != {
                "default": "denied", "requires_explicit_run_approval": True,
            }:
                self.error("policy.git.commit is invalid")
        push = value.get("push")
        if self.require_mapping(
            push, {"default", "requires_explicit_run_approval", "force_push"},
            "policy.git.push",
        ):
            expected = {
                "default": "denied", "requires_explicit_run_approval": True,
                "force_push": "forbidden",
            }
            if push != expected:
                self.error("policy.git.push is invalid")

    def validate_policy_deployment(self, value):
        keys = {
            "default", "mechanism", "repository", "branch",
            "automatic_on_approved_push", "manual_command",
            "requires_independent_verification",
            "requires_explicit_deployment_approval",
            "require_exact_commit_and_target", "require_post_deploy_verification",
            "approval_is_single_use", "require_git_state_match",
        }
        if not self.require_mapping(value, keys, "policy.deployment"):
            return
        if value.get("default") != "denied" or value.get("manual_command") != "forbidden":
            self.error("policy deployment defaults must deny manual deployment")
        for key in ("mechanism", "repository", "branch"):
            if not nonempty_string(value.get(key)):
                self.error(f"policy.deployment.{key} must be non-empty")
        if value.get("automatic_on_approved_push") is not False:
            self.error("policy.deployment.automatic_on_approved_push must be false")
        for key in (
            "requires_independent_verification",
            "requires_explicit_deployment_approval", "require_exact_commit_and_target",
            "require_post_deploy_verification", "approval_is_single_use",
            "require_git_state_match",
        ):
            if value.get(key) is not True:
                self.error(f"policy.deployment.{key} must be true")
        self.deployment_policy = value if isinstance(value, dict) else {}

    def validate_policy_artifacts(self, value):
        keys = {
            "required_by_state", "references_within_run",
            "prohibit_absolute_or_parent_paths", "sensitive_data",
        }
        if not self.require_mapping(value, keys, "policy.artifacts"):
            return
        requirements = value.get("required_by_state")
        if not isinstance(requirements, dict):
            self.error("policy.artifacts.required_by_state must be a mapping")
        else:
            for state, items in requirements.items():
                if state != "terminal" and state not in self.transitions:
                    self.error(f"artifact requirements reference unknown state {state}")
                if not isinstance(items, list) or not all(
                    isinstance(item, str) for item in items
                ):
                    self.error(f"artifact requirements for {state} are invalid")
            self.artifact_requirements = requirements
        if value.get("references_within_run") is not True:
            self.error("policy artifact references must stay within a run")
        if value.get("prohibit_absolute_or_parent_paths") is not True:
            self.error("policy must prohibit absolute and parent paths")
        if value.get("sensitive_data") != "forbidden":
            self.error("policy sensitive_data must be forbidden")

    def validate_policy_archive(self, value):
        keys = {
            "path_pattern", "terminal_only", "move_intact", "overwrite",
            "validate_before_move",
        }
        if not self.require_mapping(value, keys, "policy.archive"):
            return
        expected = {
            "path_pattern": ".workflow/archive/YYYY/<run-id>",
            "terminal_only": True, "move_intact": True,
            "overwrite": "forbidden", "validate_before_move": True,
        }
        if value != expected:
            self.error("policy.archive does not match contract")

    def validate_policy_boundary(self, value):
        keys = {
            "workflow_is_task_record", "workflow_is_durable_knowledge",
            "reusable_changes_require_pending_delta", "independent_review",
            "generated_never_hand_edited",
            "implementation_and_release_runs_are_separate",
        }
        if not self.require_mapping(value, keys, "policy.knowledge_boundary"):
            return
        expected = {
            "workflow_is_task_record": True,
            "workflow_is_durable_knowledge": False,
            "reusable_changes_require_pending_delta": True,
            "independent_review": True,
            "generated_never_hand_edited": True,
            "implementation_and_release_runs_are_separate": True,
        }
        if value != expected:
            self.error("policy.knowledge_boundary does not match contract")

    def validate_policy_validation(self, value):
        keys = {"json_output", "read_only", "safe_yaml", "closed_schemas"}
        if not self.require_mapping(value, keys, "policy.validation"):
            return
        if any(value.get(key) is not True for key in keys):
            self.error("all policy.validation flags must be true")

    def validate_policy_cleanup(self, value):
        if not self.require_mapping(
            value, {"retired_root_artifacts"}, "policy.bootstrap_cleanup"
        ):
            return
        artifacts = value.get("retired_root_artifacts")
        if not isinstance(artifacts, list):
            self.error("retired artifact policy must be a list")
            return
        paths = set()
        for index, item in enumerate(artifacts):
            label = f"policy.bootstrap_cleanup.retired_root_artifacts[{index}]"
            if not self.require_mapping(item, {"path", "required_absent"}, label):
                continue
            if not isinstance(item.get("path"), str):
                self.error(f"{label}.path must be a string")
            else:
                path = item["path"]
                pure = PurePosixPath(path)
                if pure.is_absolute() or pure.parent != PurePosixPath(".workflow"):
                    self.error(f"{label}.path must name a direct .workflow child")
                else:
                    paths.add(path)
            if item.get("required_absent") is not True:
                self.error(f"{label}.required_absent must be true")
        if len(paths) != len(artifacts):
            self.error("retired artifact paths must be unique")
        self.retired = sorted(PurePosixPath(path).name for path in paths)

    def validate_current(self):
        path = self.workflow / "current.yaml"
        current = self.load_yaml(path) if path.is_file() else None
        if current is None:
            return None
        keys = {"schema_version", "active_run", "updated_at", "repository_root"}
        self.require_mapping(current, keys, "current.yaml")
        if type(current.get("schema_version")) is not int or current.get("schema_version") != 1:
            self.error("current.schema_version must be integer 1")
        active = current.get("active_run")
        if active is not None and not isinstance(active, str):
            self.error("current.active_run must be a string or null")
        if isinstance(active, str) and not self.run_pattern.fullmatch(active):
            self.error("current.active_run is not a valid run ID")
        if current.get("repository_root") != ".":
            self.error("current.repository_root must be '.'")
        if not valid_utc_timestamp(current.get("updated_at")):
            self.error("current.updated_at must be a real UTC RFC3339 timestamp")
        return current

    def validate_state_shape(self, state, run_id):
        label = f"{run_id}/state.yaml"
        self.require_mapping(state, STATE_KEYS, label)
        if type(state.get("schema_version")) is not int or state.get("schema_version") != 1:
            self.error(f"{label} schema_version must be integer 1")
        if state.get("run_id") != run_id:
            self.error(f"state run_id does not match directory: {run_id}")
        if state.get("status") not in self.transitions:
            self.error(f"invalid status for {run_id}: {state.get('status')}")
        for key in ("scope_sha256", "plan_sha256"):
            value = state.get(key)
            if not isinstance(value, str) or not SHA256_PATTERN.fullmatch(value):
                self.error(f"{label} {key} must be a lowercase SHA-256")

        repository = state.get("repository")
        repository_keys = {"root", "branch", "baseline_head", "pre_existing_changes"}
        if self.require_mapping(repository, repository_keys, f"{label}.repository"):
            if repository.get("root") != ".":
                self.error(f"{label}.repository.root must be '.'")
            if not nonempty_string(repository.get("branch")):
                self.error(f"{label}.repository.branch must be non-empty")
            head = repository.get("baseline_head")
            if not isinstance(head, str) or not COMMIT_PATTERN.fullmatch(head):
                self.error(f"{label}.repository.baseline_head must be a commit SHA")
            changes = repository.get("pre_existing_changes")
            if not isinstance(changes, list) or not all(
                isinstance(change, str) for change in changes
            ):
                self.error(f"{label}.repository.pre_existing_changes must be strings")

        roles = state.get("roles")
        if self.require_mapping(roles, self.roles, f"{label}.roles"):
            for role, identity in roles.items():
                if not isinstance(identity, str):
                    self.error(f"{label}.roles.{role} must be a string")

        for key in ("approval_refs", "evidence_refs"):
            values = state.get(key)
            if not isinstance(values, list) or not all(
                isinstance(value, str) for value in values
            ):
                self.error(f"{label}.{key} must be a list of strings")
            elif len(values) != len(set(values)):
                self.error(f"{label}.{key} contains duplicates")

        git = state.get("git")
        git_keys = {"commit_allowed", "push_allowed", "commit", "push_target"}
        if self.require_mapping(git, git_keys, f"{label}.git"):
            for key in ("commit_allowed", "push_allowed"):
                if type(git.get(key)) is not bool:
                    self.error(f"{label}.git.{key} must be boolean")
            commit = git.get("commit")
            if commit is not None and (
                not isinstance(commit, str) or not COMMIT_PATTERN.fullmatch(commit)
            ):
                self.error(f"{label}.git.commit must be null or a commit SHA")
            target = git.get("push_target")
            if target is not None and not isinstance(target, str):
                self.error(f"{label}.git.push_target must be null or string")

        deployment = state.get("deployment")
        deployment_keys = {
            "allowed", "environment", "trigger", "commit", "target",
            "post_deploy_evidence",
        }
        if self.require_mapping(
            deployment, deployment_keys, f"{label}.deployment"
        ):
            if type(deployment.get("allowed")) is not bool:
                self.error(f"{label}.deployment.allowed must be boolean")
            for key in ("environment", "trigger"):
                if not isinstance(deployment.get(key), str):
                    self.error(f"{label}.deployment.{key} must be a string")
            commit = deployment.get("commit")
            if commit is not None and (
                not isinstance(commit, str) or not COMMIT_PATTERN.fullmatch(commit)
            ):
                self.error(f"{label}.deployment.commit must be null or commit SHA")
            for key in ("target", "post_deploy_evidence"):
                if deployment.get(key) is not None and not isinstance(
                    deployment.get(key), str
                ):
                    self.error(f"{label}.deployment.{key} must be null or string")

        blocker = state.get("blocker")
        if blocker is not None:
            blocker_keys = {"details", "resume_state"}
            if self.require_mapping(blocker, blocker_keys, f"{label}.blocker"):
                if not nonempty_string(blocker.get("details")):
                    self.error(f"{label}.blocker.details must be non-empty")
                if blocker.get("resume_state") not in (
                    set(self.transitions) - self.terminal_states - {"blocked"}
                ):
                    self.error(f"{label}.blocker.resume_state must be non-terminal")

        transitions = state.get("transitions")
        if not isinstance(transitions, list):
            self.error(f"{label}.transitions must be a list")
        else:
            for index, transition in enumerate(transitions):
                self.validate_transition_shape(transition, f"{label}.transitions[{index}]")

    def validate_transition_shape(self, transition, label):
        keys = {"from", "to", "at", "by", "reason", "resume_state"}
        if not self.require_mapping(transition, keys, label):
            return
        if transition.get("from") not in self.transitions:
            self.error(f"{label}.from is not a lifecycle state")
        if transition.get("to") not in self.transitions:
            self.error(f"{label}.to is not a lifecycle state")
        if not valid_utc_timestamp(transition.get("at")):
            self.error(f"{label}.at must be a real UTC timestamp")
        for key in ("by", "reason"):
            if not nonempty_string(transition.get(key)):
                self.error(f"{label}.{key} must be non-empty")
        resume = transition.get("resume_state")
        if resume is not None and resume not in (
            set(self.transitions) - self.terminal_states - {"blocked"}
        ):
            self.error(f"{label}.resume_state must be null or non-terminal")

    def validate_history(self, state, run_id):
        history = state.get("transitions")
        if not isinstance(history, list):
            return
        expected_from = self.initial_state
        recorded_resume = None
        for index, transition in enumerate(history):
            if not isinstance(transition, dict):
                continue
            source = transition.get("from")
            target = transition.get("to")
            resume = transition.get("resume_state")
            if source != expected_from:
                self.error(
                    f"transition history discontinuity for {run_id} at {index}"
                )
            if source == "blocked":
                allowed = set(self.terminal_states) - {"closed"}
                if recorded_resume is not None:
                    allowed.add(recorded_resume)
                if target not in allowed:
                    self.error(
                        f"blocked run {run_id} must resume only to its recorded state"
                    )
                if resume is not None:
                    self.error(f"exit from blocked must not record a new resume state")
                recorded_resume = None
            elif source in self.transitions:
                if target not in self.transitions[source]:
                    self.error(
                        f"illegal transition for {run_id}: {source} -> {target}"
                    )
                if target == "blocked":
                    if resume not in (
                        set(self.transitions) - self.terminal_states - {"blocked"}
                    ):
                        self.error(
                            f"transition into blocked for {run_id} requires resume_state"
                        )
                    recorded_resume = resume
                elif resume is not None:
                    self.error(
                        f"non-blocking transition for {run_id} must have null resume_state"
                    )
            expected_from = target
        if state.get("status") in self.transitions and expected_from != state.get("status"):
            self.error(f"transition history does not end at status for {run_id}")
        blocker = state.get("blocker")
        if state.get("status") == "blocked":
            if not isinstance(blocker, dict):
                self.error(f"blocked run lacks blocker metadata: {run_id}")
            elif blocker.get("resume_state") != recorded_resume:
                self.error(f"blocker resume_state disagrees with transition: {run_id}")
        elif blocker is not None:
            self.error(f"blocker must be null unless run is blocked: {run_id}")

    def validate_approval(self, path, run_path, run_id, state):
        approval = self.load_yaml(path)
        if approval is None:
            return None
        label = self.display(path)
        self.require_mapping(approval, APPROVAL_KEYS, label)
        if type(approval.get("schema_version")) is not int or approval.get("schema_version") != 1:
            self.error(f"{label}.schema_version must be integer 1")
        if approval.get("run_id") != run_id:
            self.error(f"approval run_id mismatch: {label}")
        gate = approval.get("gate")
        if gate not in self.gates:
            self.error(f"unknown approval gate: {label}")
        if approval.get("decision") not in {"approved", "rejected", "revoked"}:
            self.error(f"invalid approval decision: {label}")
        for key in ("by", "reason"):
            if not nonempty_string(approval.get(key)):
                self.error(f"{label}.{key} must be non-empty")
        if not valid_utc_timestamp(approval.get("at")):
            self.error(f"{label}.at must be a real UTC timestamp")
        scope = approval.get("scope_sha256")
        if not isinstance(scope, str) or not SHA256_PATTERN.fullmatch(scope):
            self.error(f"{label}.scope_sha256 must be a SHA-256")
        if scope != state.get("scope_sha256"):
            self.error(f"approval scope digest mismatch: {label}")
        artifact_hash = approval.get("artifact_sha256")
        if not isinstance(artifact_hash, str) or not SHA256_PATTERN.fullmatch(
            artifact_hash
        ):
            self.error(f"{label}.artifact_sha256 must be a SHA-256")
        artifact = self.safe_run_file(
            run_path, approval.get("artifact"), f"{label}.artifact"
        )
        # plan.md is intentionally mutable across reviewed plan revisions. Older
        # immutable plan/execution events retain the digest of the bytes they
        # approved, which can no longer be recomputed from the current file.
        # The effective (latest) events are bound to the current plan below in
        # validate_gate_lifecycle; all other approval artifacts remain directly
        # reproducible and are always re-hashed here.
        superseded_plan_event = (
            approval.get("artifact") == "plan.md"
            and artifact_hash != state.get("plan_sha256")
        )
        if (
            artifact is not None
            and not superseded_plan_event
            and artifact_hash != sha256(artifact)
        ):
            self.error(f"approval artifact digest mismatch: {label}")
        for key in ("conditions", "evidence"):
            items = approval.get(key)
            if not isinstance(items, list) or not all(
                isinstance(item, str) for item in items
            ):
                self.error(f"{label}.{key} must be a list of strings")

        binding = approval.get("binding")
        binding_keys = {"commit", "target", "environment", "trigger"}
        if self.require_mapping(binding, binding_keys, f"{label}.binding"):
            for key, value in binding.items():
                if value is not None and not isinstance(value, str):
                    self.error(f"{label}.binding.{key} must be null or string")
            commit = binding.get("commit")
            if commit is not None and not COMMIT_PATTERN.fullmatch(commit):
                self.error(f"{label}.binding.commit must be a commit SHA")
        return approval

    def inspect_event_directories(self, run_path, run_id, state):
        approvals = []
        approval_dir = run_path / "approvals"
        if approval_dir.exists():
            if not approval_dir.is_dir() or approval_dir.is_symlink():
                self.error(f"approvals must be a real directory: {run_id}")
            else:
                for path in sorted(approval_dir.iterdir()):
                    if path.is_symlink() or not path.is_file():
                        self.error(f"invalid approval entry: {self.display(path)}")
                        continue
                    if not EVENT_PATTERN.fullmatch(path.name):
                        self.error(f"invalid immutable approval filename: {path.name}")
                    else:
                        stamp, filename_gate = path.name[:-5].split("-", 1)
                        if not valid_event_stamp(stamp):
                            self.error(f"invalid approval filename timestamp: {path.name}")
                        approval = self.validate_approval(
                            path, run_path, run_id, state
                        )
                        if approval is not None:
                            if approval.get("gate") != filename_gate:
                                self.error(f"approval filename gate mismatch: {path.name}")
                            expected_at = datetime.strptime(
                                stamp, "%Y%m%dT%H%M%SZ"
                            ).strftime("%Y-%m-%dT%H:%M:%SZ")
                            if approval.get("at") != expected_at:
                                self.error(
                                    f"approval filename timestamp mismatch: {path.name}"
                                )
                            approvals.append((path, approval))

        evidence_files = []
        evidence_dir = run_path / "evidence"
        if evidence_dir.exists():
            if not evidence_dir.is_dir() or evidence_dir.is_symlink():
                self.error(f"evidence must be a real directory: {run_id}")
            else:
                for path in sorted(evidence_dir.iterdir()):
                    if path.is_symlink() or not path.is_file():
                        self.error(f"invalid evidence entry: {self.display(path)}")
                    elif not EVIDENCE_PATTERN.fullmatch(path.name):
                        self.error(f"invalid immutable evidence filename: {path.name}")
                    else:
                        stamp = path.name.split("-", 1)[0]
                        if not valid_event_stamp(stamp):
                            self.error(f"invalid evidence filename timestamp: {path.name}")
                        evidence_files.append(path)
        return approvals, evidence_files

    def effective_approvals(self, approvals, scope):
        grouped = {}
        for path, approval in approvals:
            if approval.get("gate") not in self.gates:
                continue
            if approval.get("scope_sha256") != scope:
                continue
            key = approval["gate"]
            grouped.setdefault(key, []).append((path, approval))
        effective = {}
        for gate, events in grouped.items():
            events.sort(key=lambda item: (item[1].get("at", ""), item[0].name))
            effective[gate] = events[-1][1]
        return effective

    def validate_references(self, run_path, state, approvals, evidence_files):
        approval_refs = state.get("approval_refs", [])
        evidence_refs = state.get("evidence_refs", [])
        if not isinstance(approval_refs, list):
            approval_refs = []
        if not isinstance(evidence_refs, list):
            evidence_refs = []
        for reference in approval_refs:
            self.safe_run_file(run_path, reference, "approval reference")
        for reference in evidence_refs:
            self.safe_run_file(run_path, reference, "evidence reference")

        discovered_approvals = {
            str(path.relative_to(run_path)) for path, _ in approvals
        }
        discovered_evidence = {
            str(path.relative_to(run_path)) for path in evidence_files
        }
        if set(approval_refs) != discovered_approvals:
            self.error("approval_refs must enumerate every immutable approval event")
        if not set(evidence_refs).issubset(discovered_evidence):
            self.error("evidence_refs contains an undiscovered evidence artifact")

    def require_gate(self, effective, gate, run_id):
        event = effective.get(gate)
        if event is None or event.get("decision") != "approved":
            self.error(f"missing effective {gate} approval for {run_id}")
            return None
        return event

    def validate_gate_lifecycle(self, run_path, state, effective):
        run_id = state.get("run_id", run_path.name)
        status = state.get("status")
        history_targets = {
            transition.get("to")
            for transition in state.get("transitions", [])
            if isinstance(transition, dict)
        }
        phases_reached = history_targets | {status}
        required_gates = {
            gate
            for phase in phases_reached
            for gate in self.lifecycle_requirements.get(phase, [])
        }
        if "plan_approval" in required_gates:
            event = self.require_gate(effective, "plan_approval", run_id)
            plan = run_path / "plan.md"
            if not plan.is_file() or plan.is_symlink():
                self.error(f"missing safe plan.md for {run_id}")
            else:
                plan_digest = sha256(plan)
                if plan_digest != state.get("plan_sha256"):
                    self.error(f"state plan digest mismatch for {run_id}")
                if event is not None and (
                    event.get("artifact") != "plan.md"
                    or event.get("artifact_sha256") != plan_digest
                ):
                    self.error(f"plan approval does not bind exact plan digest: {run_id}")
        if "execution_start" in required_gates:
            event = self.require_gate(effective, "execution_start", run_id)
            if event is not None:
                if event.get("artifact") != "plan.md" or event.get(
                    "artifact_sha256"
                ) != state.get("plan_sha256"):
                    self.error(
                        f"execution_start does not bind current plan: {run_id}"
                    )
                self.validate_execution_start_evidence(state, event, run_id)
        if "verification" in required_gates:
            verification = self.require_gate(effective, "verification", run_id)
            if not state.get("evidence_refs"):
                self.error(f"missing verification evidence for {run_id}")
            elif verification is not None and verification.get(
                "artifact"
            ) not in state.get("evidence_refs", []):
                self.error(
                    f"verification approval does not bind referenced evidence: {run_id}"
                )

        deployed_path = "deployment_approval" in required_gates
        if deployed_path:
            deployment_event = self.require_gate(
                effective, "deployment_approval", run_id
            )
            self.validate_deployment_binding(
                run_path, state, deployment_event
            )
        if "closure" in required_gates:
            closure = self.require_gate(effective, "closure", run_id)
            if not (run_path / "result.md").is_file():
                self.error(f"closed run lacks result.md: {run_id}")
            elif closure is not None and (
                closure.get("artifact") != "result.md"
                or closure.get("artifact_sha256") != sha256(run_path / "result.md")
            ):
                self.error(f"closure approval does not bind result.md: {run_id}")

    def validate_execution_start_evidence(self, state, event, run_id):
        repository = state.get("repository")
        if not isinstance(repository, dict):
            return
        changes = repository.get("pre_existing_changes")
        if not isinstance(changes, list):
            return
        expected_prefix = [
            f"repository_root={repository.get('root')}",
            f"branch={repository.get('branch')}",
            f"baseline_head={repository.get('baseline_head')}",
            f"pre_existing_changes_sha256={canonical_changes_sha256(changes)}",
        ]
        evidence = event.get("evidence")
        allowed_policy_digests = {
            sha256(self.workflow / "policy.yaml"), *self.accepted_policy_sha256
        }
        valid = (
            isinstance(evidence, list)
            and len(evidence) == 6
            and evidence[:4] == expected_prefix
            and evidence[5] == f"plan_sha256={state.get('plan_sha256')}"
            and isinstance(evidence[4], str)
            and evidence[4].startswith("policy_sha256=")
            and evidence[4].removeprefix("policy_sha256=") in allowed_policy_digests
        )
        if not valid:
            self.error(
                f"execution_start evidence does not bind repository, policy, "
                f"changes, and plan: {run_id}"
            )

    def validate_deployment_binding(self, run_path, state, event):
        run_id = state.get("run_id", run_path.name)
        deployment = state.get("deployment")
        if not isinstance(deployment, dict):
            return
        branch = self.deployment_policy.get("branch")
        expected = {
            "environment": self.project_policy.get("environment"),
            "trigger": self.deployment_policy.get("mechanism"),
            "target": f"origin/{branch}" if nonempty_string(branch) else None,
        }
        if deployment.get("allowed") is not True:
            self.error(f"deployed path is not explicitly allowed: {run_id}")
        for key, value in expected.items():
            if deployment.get(key) != value:
                self.error(f"deployment {key} is not exact for {run_id}")
        commit = deployment.get("commit")
        if not isinstance(commit, str) or not COMMIT_PATTERN.fullmatch(commit):
            self.error(f"deployment commit is not exact for {run_id}")
        if event is not None:
            binding = event.get("binding")
            wanted = {
                "commit": commit, "target": expected["target"],
                "environment": expected["environment"], "trigger": expected["trigger"],
            }
            if binding != wanted:
                self.error(f"deployment approval binding is not exact: {run_id}")
            if event.get("artifact_sha256") != state.get("plan_sha256"):
                self.error(f"deployment approval artifact is not current: {run_id}")

        git = state.get("git")
        if not isinstance(git, dict):
            return
        if git.get("commit_allowed") is not True:
            self.error(f"deployed path must allow the exact commit: {run_id}")
        if git.get("push_allowed") is not True:
            self.error(f"deployed path must allow the exact push: {run_id}")
        if git.get("commit") != commit:
            self.error(f"Git commit disagrees with deployment commit: {run_id}")
        if git.get("push_target") != expected["target"]:
            self.error(f"deployed Git push target is not exact: {run_id}")

        post_reference = deployment.get("post_deploy_evidence")
        if self.safe_run_file(
            run_path, post_reference, "post-deploy evidence"
        ) is None:
            self.error(f"deployed path lacks post-deploy evidence: {run_id}")

    def validate_artifact_requirements(self, run_path, state):
        run_id = state.get("run_id", run_path.name)
        status = state.get("status")
        history = state.get("transitions", [])
        reached = {status}
        if isinstance(history, list):
            reached.update(
                transition.get("to")
                for transition in history
                if isinstance(transition, dict)
            )
        requirements = {
            requirement
            for phase in reached
            for requirement in self.artifact_requirements.get(phase, [])
        }
        if status in self.terminal_states:
            requirements.update(self.artifact_requirements.get("terminal", []))
        for name in sorted(requirements & {"request.md", "plan.md", "state.yaml", "result.md"}):
            path = run_path / name
            if not path.is_file() or path.is_symlink():
                self.error(f"{name} required by policy for {run_id}")
        if "verification_evidence" in requirements and not state.get("evidence_refs"):
            self.error(f"verification evidence required by policy for {run_id}")
        if "post_deploy_evidence" in requirements:
            deployment = state.get("deployment")
            if not isinstance(deployment, dict) or not deployment.get("post_deploy_evidence"):
                self.error(f"post-deploy evidence required by policy for {run_id}")

    def validate_independence(self, state, effective):
        roles = state.get("roles")
        if not isinstance(roles, dict):
            return
        implementer = roles.get("implementer")
        status = state.get("status")
        history = state.get("transitions", [])
        phases_reached = {status}
        if isinstance(history, list):
            phases_reached.update(
                item.get("to") for item in history if isinstance(item, dict)
            )
        if phases_reached & {"ready_for_release", "deployed", "closed"}:
            verifier = roles.get("verifier")
            if not nonempty_string(verifier) or verifier == implementer:
                self.error("production verifier must be non-empty and independent")
            event = effective.get("verification")
            if event is not None and event.get("by") != verifier:
                self.error("verification event identity must match verifier role")
        deployed = status == "deployed" or any(
            isinstance(item, dict) and item.get("to") == "deployed"
            for item in history if isinstance(history, list)
        )
        if deployed:
            releaser = roles.get("release_approver")
            if not nonempty_string(releaser) or releaser == implementer:
                self.error(
                    "production release_approver must be non-empty and independent"
                )
            event = effective.get("deployment_approval")
            if event is not None and event.get("by") != releaser:
                self.error(
                    "deployment event identity must match release_approver role"
                )

    def validate_run(self, run_path, archived=False):
        run_id = run_path.name
        self.runs_checked += 1
        if not self.run_pattern.fullmatch(run_id):
            self.error(f"invalid run ID: {run_id}")
            return None
        if run_path.is_symlink():
            self.error(f"run directory must not be a symlink: {run_id}")
            return None
        state_path = run_path / "state.yaml"
        if not state_path.is_file() or state_path.is_symlink():
            self.error(f"missing safe state.yaml for {run_id}")
            return None
        state = self.load_yaml(state_path)
        if state is None:
            return None
        self.validate_state_shape(state, run_id)
        self.validate_history(state, run_id)
        approvals, evidence = self.inspect_event_directories(
            run_path, run_id, state
        )
        self.validate_references(run_path, state, approvals, evidence)
        effective = self.effective_approvals(
            approvals, state.get("scope_sha256")
        )
        deployment_approvals = [
            approval for _, approval in approvals
            if approval.get("gate") == "deployment_approval"
            and approval.get("scope_sha256") == state.get("scope_sha256")
            and approval.get("decision") == "approved"
        ]
        if len(deployment_approvals) > 1:
            self.error(f"deployment approval must be single-use: {run_id}")
        self.validate_artifact_requirements(run_path, state)
        self.validate_gate_lifecycle(run_path, state, effective)
        self.validate_independence(state, effective)
        status = state.get("status")
        if archived and status not in self.terminal_states:
            self.error(f"archived run is non-terminal: {run_id}")
        return status

    def inventory_runs(self):
        inventory = []
        runs_dir = self.workflow / "runs"
        if runs_dir.exists():
            if not runs_dir.is_dir() or runs_dir.is_symlink():
                self.error(".workflow/runs must be a real directory")
            else:
                for entry in sorted(runs_dir.iterdir()):
                    if not entry.is_dir() or entry.is_symlink():
                        self.error(f"invalid runs entry: {entry.name}")
                    else:
                        inventory.append((entry, False, None))
        archive_dir = self.workflow / "archive"
        if archive_dir.exists():
            if not archive_dir.is_dir() or archive_dir.is_symlink():
                self.error(".workflow/archive must be a real directory")
            else:
                for year_dir in sorted(archive_dir.iterdir()):
                    if (
                        not year_dir.is_dir() or year_dir.is_symlink()
                        or not re.fullmatch(r"[0-9]{4}", year_dir.name)
                    ):
                        self.error(f"invalid archive year entry: {year_dir.name}")
                        continue
                    for entry in sorted(year_dir.iterdir()):
                        if not entry.is_dir() or entry.is_symlink():
                            self.error(f"invalid archive run entry: {entry.name}")
                        else:
                            inventory.append((entry, True, year_dir.name))
        ids = [path.name for path, _, _ in inventory]
        duplicates = sorted({run_id for run_id in ids if ids.count(run_id) > 1})
        if duplicates:
            self.error(f"duplicate run IDs across active/archive: {duplicates}")
        for path, archived, year in inventory:
            if archived and self.run_pattern.fullmatch(path.name):
                if path.name[:4] != year:
                    self.error(
                        f"archive year does not agree with run ID: {path.name}"
                    )
        return inventory

    def read_inventory_status(self, path):
        state_path = path / "state.yaml"
        if not state_path.is_file() or state_path.is_symlink():
            return None
        state = self.load_yaml(state_path)
        if state is None:
            return None
        status = state.get("status")
        return status if status in self.transitions else None

    def validate(self, selected=None, include_archive=False):
        self.validate_policy()
        self.validate_contract_files()
        current = self.validate_current()
        inventory = self.inventory_runs()

        if selected is not None and not self.run_pattern.fullmatch(selected):
            self.error(f"selected run ID is invalid: {selected}")
            selected = None

        statuses = {}
        for path, archived, _ in inventory:
            status = self.read_inventory_status(path)
            statuses[(path.name, archived)] = status
            if archived and status is not None and status not in self.terminal_states:
                self.error(f"archived run is non-terminal: {path.name}")

        active = [
            run_id for (run_id, archived), status in statuses.items()
            if not archived and status is not None and status not in self.terminal_states
        ]
        if self.one_active and len(active) > 1:
            self.error(f"multiple non-terminal runs: {active}")
        pointer = current.get("active_run") if current else None
        if pointer is None and active and self.current_pointer_required:
            self.error("non-terminal run exists without current.active_run")
        elif pointer is not None and pointer not in active:
            self.error("current.active_run does not identify an active run")

        candidates = []
        if selected is None:
            candidates = [
                item for item in inventory if include_archive or not item[1]
            ]
        else:
            candidates = [
                item for item in inventory
                if item[0].name == selected and (include_archive or not item[1])
            ]
            if not candidates:
                self.error(f"selected run not found: {selected}")
        for path, archived, _ in candidates:
            self.validate_run(path, archived)

        return {
            "valid": not self.errors,
            "errors": self.errors,
            "warnings": self.warnings,
            "runs_checked": self.runs_checked,
            "retired_artifacts_checked": len(self.retired),
        }


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--run")
    parser.add_argument("--include-archive", action="store_true")
    arguments = parser.parse_args(argv)
    result = Validator(arguments.project).validate(
        arguments.run, arguments.include_archive
    )
    print(json.dumps(result, separators=(",", ":"), sort_keys=True))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
