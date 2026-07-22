import hashlib
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "workflow_validate", ROOT / ".workflow/scripts/validate.py"
)
VALIDATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATE)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.project = Path(self.temporary.name)
        shutil.copytree(ROOT / ".workflow", self.project / ".workflow")

    def tearDown(self):
        self.temporary.cleanup()

    def validate(self, selected=None, include_archive=False):
        return VALIDATE.Validator(self.project).validate(selected, include_archive)

    def assert_invalid(self, text=None, selected=None, include_archive=False):
        result = self.validate(selected, include_archive)
        self.assertFalse(result["valid"], result)
        if text is not None:
            self.assertIn(text, "\n".join(result["errors"]))

    def read_yaml(self, path):
        return VALIDATE.yaml.safe_load(path.read_text(encoding="utf-8"))

    def write_yaml(self, path, value):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            VALIDATE.yaml.safe_dump(value, sort_keys=False), encoding="utf-8"
        )

    def transition(self, source, target, resume_state=None, second=0):
        return {
            "from": source,
            "to": target,
            "at": f"2026-07-21T23:00:{second:02d}Z",
            "by": "workflow-actor",
            "reason": f"move from {source} to {target}",
            "resume_state": resume_state,
        }

    def approval(
        self,
        run_path,
        state,
        gate,
        artifact,
        identity,
        second,
        decision="approved",
        binding=None,
    ):
        artifact_path = run_path / artifact
        timestamp = f"20260721T2300{second:02d}Z"
        relative = f"approvals/{timestamp}-{gate}.yaml"
        event = {
            "schema_version": 1,
            "run_id": state["run_id"],
            "gate": gate,
            "decision": decision,
            "by": identity,
            "at": f"2026-07-21T23:00:{second:02d}Z",
            "scope_sha256": state["scope_sha256"],
            "artifact": artifact,
            "artifact_sha256": digest(artifact_path),
            "binding": binding or {
                "commit": None,
                "target": None,
                "environment": None,
                "trigger": None,
            },
            "conditions": [],
            "evidence": [],
            "reason": f"{decision} exact {gate} scope",
        }
        if gate == "execution_start":
            repository = state["repository"]
            event["evidence"] = [
                f"repository_root={repository['root']}",
                f"branch={repository['branch']}",
                f"baseline_head={repository['baseline_head']}",
                "pre_existing_changes_sha256="
                f"{VALIDATE.canonical_changes_sha256(repository['pre_existing_changes'])}",
                f"policy_sha256={digest(self.project / '.workflow/policy.yaml')}",
                f"plan_sha256={state['plan_sha256']}",
            ]
        self.write_yaml(run_path / relative, event)
        state["approval_refs"].append(relative)
        return relative

    def make_run(
        self,
        status="ready_for_release",
        run_id="20260721T230000Z-valid-run",
        deployed=False,
        archive_year=None,
    ):
        if archive_year is None:
            run_path = self.project / ".workflow/runs" / run_id
        else:
            run_path = self.project / ".workflow/archive" / archive_year / run_id
        (run_path / "approvals").mkdir(parents=True)
        (run_path / "evidence").mkdir()
        (run_path / "request.md").write_text("# Request\n", encoding="utf-8")
        (run_path / "plan.md").write_text("# Plan\n", encoding="utf-8")
        verification_ref = "evidence/20260721T230005Z-verification.md"
        (run_path / verification_ref).write_text(
            "real verification evidence\n", encoding="utf-8"
        )

        roles = {role: f"{role}-identity" for role in VALIDATE.ROLES}
        roles["implementer"] = "implementation-person"
        roles["verifier"] = "verification-person"
        roles["release_approver"] = "release-person"
        state = {
            "schema_version": 1,
            "run_id": run_id,
            "status": status,
            "repository": {
                "root": ".",
                "branch": "main",
                "baseline_head": "a" * 40,
                "pre_existing_changes": [],
            },
            "roles": roles,
            "scope_sha256": "1" * 64,
            "plan_sha256": digest(run_path / "plan.md"),
            "approval_refs": [],
            "evidence_refs": [verification_ref],
            "git": {
                "commit_allowed": deployed,
                "push_allowed": deployed,
                "commit": "b" * 40 if deployed else None,
                "push_target": "origin/main" if deployed else None,
            },
            "deployment": {
                "allowed": deployed,
                "environment": "production",
                "trigger": "github_push_webhook",
                "commit": "b" * 40 if deployed else None,
                "target": "origin/main" if deployed else None,
                "post_deploy_evidence": None,
            },
            "blocker": None,
            "transitions": [],
        }

        route = [
            "discovery", "planned", "awaiting_approval", "approved",
            "executing", "verifying", "ready_for_release",
        ]
        if deployed:
            route.append("deployed")
        if status == "closed":
            route.append("closed")
        elif status not in {"ready_for_release", "deployed"}:
            route = route[:0]
            if status == "planned":
                route = ["discovery", "planned"]
            elif status == "awaiting_approval":
                route = ["discovery", "planned", "awaiting_approval"]

        source = "intake"
        for second, target in enumerate(route):
            state["transitions"].append(
                self.transition(source, target, second=second)
            )
            source = target

        if status == "closed":
            (run_path / "result.md").write_text(
                "# Status\nclosed\n", encoding="utf-8"
            )

        self.approval(
            run_path, state, "plan_approval", "plan.md",
            roles["approver"], 10,
        )
        self.approval(
            run_path, state, "execution_start", "plan.md",
            roles["implementer"], 11,
        )
        self.approval(
            run_path, state, "verification", verification_ref,
            roles["verifier"], 12,
        )
        if deployed:
            post_ref = "evidence/20260721T230006Z-post-deploy.md"
            (run_path / post_ref).write_text(
                "real post-deploy evidence\n", encoding="utf-8"
            )
            state["evidence_refs"].append(post_ref)
            state["deployment"]["post_deploy_evidence"] = post_ref
            binding = {
                "commit": "b" * 40,
                "target": "origin/main",
                "environment": "production",
                "trigger": "github_push_webhook",
            }
            self.approval(
                run_path, state, "deployment_approval", "plan.md",
                roles["release_approver"], 13, binding=binding,
            )
        if status == "closed":
            self.approval(
                run_path, state, "closure", "result.md",
                roles["approver"], 14,
            )

        self.write_yaml(run_path / "state.yaml", state)
        current_path = self.project / ".workflow/current.yaml"
        current = self.read_yaml(current_path)
        current["active_run"] = (
            None if status in VALIDATE.TERMINAL_STATES or archive_year else run_id
        )
        self.write_yaml(current_path, current)
        return run_path, state

    def save_state(self, run_path, state):
        self.write_yaml(run_path / "state.yaml", state)

    def test_actual_neutral_repository_contract(self):
        result = VALIDATE.Validator(ROOT).validate()
        self.assertTrue(result["valid"], result)
        self.assertEqual(result["runs_checked"], 0)
        self.assertEqual(result["retired_artifacts_checked"], 9)

    def test_policy_contains_every_role_gate_state_and_coherent_graph(self):
        policy = self.read_yaml(self.project / ".workflow/policy.yaml")
        self.assertEqual(set(policy["roles"]["required"]), VALIDATE.ROLES)
        self.assertEqual(set(policy["gates"]["required"]), VALIDATE.GATES)
        self.assertEqual(
            set(policy["lifecycle"]["transitions"]),
            set(VALIDATE.STATIC_TRANSITIONS),
        )
        self.assertTrue(
            all(not VALIDATE.STATIC_TRANSITIONS[x] for x in VALIDATE.TERMINAL_STATES)
        )
        self.assertTrue(self.validate()["valid"])

    def test_every_retired_path_is_absent_and_reintroduction_fails(self):
        for name in VALIDATE.RETIRED:
            with self.subTest(name=name):
                path = self.project / ".workflow" / name
                self.assertFalse(path.exists())
                path.write_text("retired", encoding="utf-8")
                self.assert_invalid("retired artifact")
                path.unlink()

    def test_unknown_ignored_root_artifact_fails(self):
        (self.project / ".workflow/.ignored").write_text("x", encoding="utf-8")
        self.assert_invalid("unknown .workflow root entries")

    def test_valid_ready_for_release_and_closed_runs(self):
        self.make_run()
        self.assertTrue(self.validate()["valid"], self.validate())
        shutil.rmtree(self.project / ".workflow/runs")
        self.make_run(status="closed")
        self.assertTrue(self.validate()["valid"], self.validate())

    def test_valid_blocked_resume_to_recorded_state(self):
        run_path, state = self.make_run()
        state["status"] = "executing"
        state["transitions"] = state["transitions"][:5]
        state["transitions"].append(
            self.transition("executing", "blocked", "executing", 20)
        )
        state["transitions"].append(
            self.transition("blocked", "executing", None, 21)
        )
        self.save_state(run_path, state)
        self.assertTrue(self.validate()["valid"], self.validate())

    def test_blocked_resume_to_other_state_and_bad_metadata_fail(self):
        run_path, state = self.make_run()
        state["status"] = "verifying"
        state["transitions"] = state["transitions"][:5]
        state["transitions"].append(
            self.transition("executing", "blocked", "executing", 20)
        )
        state["transitions"].append(
            self.transition("blocked", "verifying", None, 21)
        )
        self.save_state(run_path, state)
        self.assert_invalid("recorded state")

        state["status"] = "blocked"
        state["transitions"] = state["transitions"][:-1]
        state["blocker"] = {"details": "", "resume_state": "closed"}
        self.save_state(run_path, state)
        self.assert_invalid("blocker")

    def test_two_active_runs_fail_even_when_one_is_selected(self):
        first = "20260721T230000Z-first-run"
        second = "20260721T230001Z-second-run"
        self.make_run(run_id=first)
        self.make_run(run_id=second)
        self.assert_invalid("multiple non-terminal", selected=second)

    def test_illegal_transition_and_terminal_outgoing_policy_fail(self):
        run_path, state = self.make_run()
        state["transitions"][0]["to"] = "closed"
        self.save_state(run_path, state)
        self.assert_invalid("illegal transition")

        policy_path = self.project / ".workflow/policy.yaml"
        policy = self.read_yaml(policy_path)
        policy["lifecycle"]["transitions"]["closed"] = ["intake"]
        self.write_yaml(policy_path, policy)
        self.assert_invalid("lifecycle graph")

    def test_plan_digest_and_plan_approval_digest_are_recomputed(self):
        run_path, state = self.make_run()
        (run_path / "plan.md").write_text("changed plan\n", encoding="utf-8")
        self.assert_invalid("plan approval does not bind exact plan digest")

        (run_path / "plan.md").write_text("# Plan\n", encoding="utf-8")
        event_path = run_path / state["approval_refs"][0]
        event = self.read_yaml(event_path)
        event["artifact_sha256"] = "f" * 64
        self.write_yaml(event_path, event)
        self.assert_invalid("plan approval does not bind exact plan digest")

    def test_revised_plan_keeps_superseded_approval_history_auditable(self):
        current_path = self.project / ".workflow/current.yaml"
        original_active_run = self.read_yaml(current_path)["active_run"]
        run_path, state = self.make_run(status="closed")
        current = self.read_yaml(current_path)
        current["active_run"] = original_active_run
        self.write_yaml(current_path, current)
        (run_path / "plan.md").write_text("# Revised plan\n", encoding="utf-8")
        state["plan_sha256"] = digest(run_path / "plan.md")
        self.approval(
            run_path, state, "plan_approval", "plan.md",
            state["roles"]["approver"], 20,
        )
        self.approval(
            run_path, state, "execution_start", "plan.md",
            state["roles"]["implementer"], 21,
        )
        self.save_state(run_path, state)

        result = self.validate(selected=state["run_id"])
        self.assertTrue(result["valid"], result)

        latest = run_path / state["approval_refs"][-2]
        event = self.read_yaml(latest)
        event["artifact_sha256"] = "f" * 64
        self.write_yaml(latest, event)
        self.assert_invalid("plan approval does not bind exact plan digest")

    def test_every_lifecycle_gate_is_required(self):
        cases = [
            ("ready_for_release", "plan_approval"),
            ("ready_for_release", "execution_start"),
            ("ready_for_release", "verification"),
            ("closed", "closure"),
        ]
        for index, (status, gate) in enumerate(cases):
            with self.subTest(gate=gate):
                run_id = f"20260721T2300{index:02d}Z-gate-run"
                run_path, state = self.make_run(status=status, run_id=run_id)
                target = next(ref for ref in state["approval_refs"] if gate in ref)
                (run_path / target).unlink()
                state["approval_refs"].remove(target)
                self.save_state(run_path, state)
                self.assert_invalid(f"missing effective {gate}")
                shutil.rmtree(self.project / ".workflow/runs")

    def test_execution_start_binds_every_repository_and_policy_field(self):
        mutations = [
            ("root", "subdirectory"),
            ("branch", "other"),
            ("baseline_head", "c" * 40),
            ("pre_existing_changes", ["M user-change.txt"]),
        ]
        for index, (field, value) in enumerate(mutations):
            with self.subTest(field=field):
                run_id = f"20260721T2310{index:02d}Z-binding-run"
                run_path, state = self.make_run(run_id=run_id)
                state["repository"][field] = value
                self.save_state(run_path, state)
                self.assert_invalid("execution_start evidence")
                shutil.rmtree(self.project / ".workflow/runs")

        run_path, state = self.make_run(
            run_id="20260721T231010Z-policy-binding-run"
        )
        policy_path = self.project / ".workflow/policy.yaml"
        policy = self.read_yaml(policy_path)
        policy["project"]["authority_precedence"] += " Changed."
        self.write_yaml(policy_path, policy)
        self.assert_invalid("execution_start evidence")

        policy["project"]["authority_precedence"] = (
            "System, platform, repository, and current user authority "
            "override workflow records."
        )
        self.write_yaml(policy_path, policy)
        state["plan_sha256"] = "f" * 64
        self.save_state(run_path, state)
        self.assert_invalid("execution_start evidence")

    def test_gate_obligations_survive_blocked_failed_and_cancelled_states(self):
        terminal_targets = ["blocked", "failed", "cancelled"]
        for index, target in enumerate(terminal_targets):
            with self.subTest(target=target):
                run_id = f"20260721T2320{index:02d}Z-durable-gate-run"
                run_path, state = self.make_run(run_id=run_id)
                source = "ready_for_release"
                resume = "ready_for_release" if target == "blocked" else None
                state["transitions"].append(
                    self.transition(source, target, resume, 30)
                )
                state["status"] = target
                if target == "blocked":
                    state["blocker"] = {
                        "details": "waiting for external input",
                        "resume_state": "ready_for_release",
                    }
                else:
                    (run_path / "result.md").write_text(
                        f"# Status\n{target}\n", encoding="utf-8"
                    )
                    current = self.read_yaml(
                        self.project / ".workflow/current.yaml"
                    )
                    current["active_run"] = None
                    self.write_yaml(
                        self.project / ".workflow/current.yaml", current
                    )
                execution_ref = next(
                    ref for ref in state["approval_refs"]
                    if "execution_start" in ref
                )
                (run_path / execution_ref).unlink()
                state["approval_refs"].remove(execution_ref)
                self.save_state(run_path, state)
                self.assert_invalid("missing effective execution_start")

                verification_ref = next(
                    ref for ref in state["approval_refs"]
                    if "verification" in ref
                )
                (run_path / verification_ref).unlink()
                state["approval_refs"].remove(verification_ref)
                self.save_state(run_path, state)
                self.assert_invalid("missing effective verification")
                shutil.rmtree(self.project / ".workflow/runs")

    def test_deployed_git_must_match_exact_deployment(self):
        mutations = [
            ("commit_allowed", False, "allow the exact commit"),
            ("push_allowed", False, "allow the exact push"),
            ("commit", "c" * 40, "disagrees with deployment commit"),
            ("push_target", "origin/other", "must be origin/main"),
        ]
        for index, (field, value, message) in enumerate(mutations):
            with self.subTest(field=field):
                run_id = f"20260721T2330{index:02d}Z-git-match-run"
                run_path, state = self.make_run(
                    status="deployed", run_id=run_id, deployed=True
                )
                state["git"][field] = value
                self.save_state(run_path, state)
                self.assert_invalid(message)
                shutil.rmtree(self.project / ".workflow/runs")

    def test_later_rejection_and_revocation_override_approval(self):
        for decision in ("rejected", "revoked"):
            with self.subTest(decision=decision):
                run_path, state = self.make_run()
                self.approval(
                    run_path, state, "verification",
                    "evidence/20260721T230005Z-verification.md",
                    state["roles"]["verifier"], 20, decision=decision,
                )
                self.save_state(run_path, state)
                self.assert_invalid("missing effective verification")
                shutil.rmtree(self.project / ".workflow/runs")

    def test_deployment_approval_exact_binding_and_post_evidence(self):
        run_path, state = self.make_run(status="deployed", deployed=True)
        deployment_ref = next(
            ref for ref in state["approval_refs"] if "deployment_approval" in ref
        )
        event = self.read_yaml(run_path / deployment_ref)
        event["binding"]["target"] = "origin/other"
        self.write_yaml(run_path / deployment_ref, event)
        self.assert_invalid("binding is not exact")

        event["binding"]["target"] = "origin/main"
        self.write_yaml(run_path / deployment_ref, event)
        (run_path / state["deployment"]["post_deploy_evidence"]).unlink()
        self.assert_invalid("post-deploy evidence")

    def test_deployment_approval_is_single_use(self):
        run_path, state = self.make_run(status="deployed", deployed=True)
        self.approval(
            run_path,
            state,
            "deployment_approval",
            "plan.md",
            state["roles"]["release_approver"],
            20,
            binding={
                "commit": "b" * 40,
                "target": "origin/main",
                "environment": "production",
                "trigger": "github_push_webhook",
            },
        )
        self.save_state(run_path, state)
        self.assert_invalid("single-use")

    def test_deployed_closure_requires_deployment_approval(self):
        run_path, state = self.make_run(
            status="closed", deployed=True,
            run_id="20260721T230000Z-deployed-closure",
        )
        target = next(
            ref for ref in state["approval_refs"] if "deployment_approval" in ref
        )
        (run_path / target).unlink()
        state["approval_refs"].remove(target)
        self.save_state(run_path, state)
        self.assert_invalid("missing effective deployment_approval")

    def test_nested_unknown_keys_and_wrong_types_fail(self):
        run_path, state = self.make_run()
        state["repository"]["unknown"] = True
        state["git"]["commit_allowed"] = "false"
        state["roles"]["verifier"] = 42
        state["deployment"]["allowed"] = "false"
        state["transitions"][0]["extra"] = "x"
        self.save_state(run_path, state)
        self.assert_invalid("unknown keys")
        self.assert_invalid("must be boolean")

        policy_path = self.project / ".workflow/policy.yaml"
        policy = self.read_yaml(policy_path)
        policy["git"]["commit"]["unknown"] = True
        self.write_yaml(policy_path, policy)
        self.assert_invalid("policy.git.commit")

    def test_impossible_utc_dates_fail_in_state_current_and_approval(self):
        current_path = self.project / ".workflow/current.yaml"
        current = self.read_yaml(current_path)
        current["updated_at"] = "2026-02-30T25:61:61Z"
        self.write_yaml(current_path, current)
        self.assert_invalid("real UTC")

        current["updated_at"] = "2026-07-21T22:38:41Z"
        self.write_yaml(current_path, current)
        run_path, state = self.make_run()
        state["transitions"][0]["at"] = "2026-02-30T00:00:00Z"
        self.save_state(run_path, state)
        self.assert_invalid("real UTC")

        state["transitions"][0]["at"] = "2026-07-21T23:00:00Z"
        self.save_state(run_path, state)
        event_path = run_path / state["approval_refs"][0]
        event = self.read_yaml(event_path)
        event["at"] = "2026-13-01T00:00:00Z"
        self.write_yaml(event_path, event)
        self.assert_invalid("real UTC")

    def test_absolute_traversal_backslash_and_symlink_references_fail(self):
        bad_values = ["/tmp/evidence.md", "../evidence.md", "evidence\\x.md"]
        for index, bad in enumerate(bad_values):
            with self.subTest(reference=bad):
                run_id = f"20260721T2300{index:02d}Z-path-run"
                run_path, state = self.make_run(run_id=run_id)
                state["evidence_refs"] = [bad]
                self.save_state(run_path, state)
                self.assert_invalid("evidence reference")
                shutil.rmtree(self.project / ".workflow/runs")

        run_path, state = self.make_run()
        real = run_path / "evidence/20260721T230005Z-verification.md"
        real.unlink()
        real.symlink_to(self.project / ".workflow/README.md")
        self.assert_invalid("symlink")

        real.unlink()
        outside = self.project / "outside"
        outside.mkdir()
        (outside / "evidence.md").write_text("outside", encoding="utf-8")
        (run_path / "linked-evidence").symlink_to(outside, target_is_directory=True)
        state["evidence_refs"] = ["linked-evidence/evidence.md"]
        self.save_state(run_path, state)
        self.assert_invalid("symlink")

    def test_invalid_selected_run_id_is_rejected_before_path_use(self):
        self.assert_invalid("selected run ID is invalid", selected="../escape")

    def test_archive_year_terminal_and_duplicate_invariants(self):
        run_id = "20260721T230000Z-archive-run"
        self.make_run(status="closed", run_id=run_id, archive_year="2025")
        self.assert_invalid("archive year", include_archive=True)

        shutil.rmtree(self.project / ".workflow/archive")
        self.make_run(
            status="ready_for_release", run_id=run_id, archive_year="2026"
        )
        self.assert_invalid("archived run is non-terminal", include_archive=True)

        shutil.rmtree(self.project / ".workflow/archive")
        self.make_run(status="closed", run_id=run_id, archive_year="2026")
        self.make_run(status="closed", run_id=run_id)
        self.assert_invalid("duplicate run IDs", include_archive=True)

    def test_request_plan_state_and_terminal_result_requirements(self):
        run_path, state = self.make_run(status="planned")
        (run_path / "request.md").unlink()
        self.assert_invalid("request.md required")

        shutil.rmtree(self.project / ".workflow/runs")
        run_path, state = self.make_run(status="awaiting_approval")
        (run_path / "plan.md").unlink()
        self.assert_invalid("plan.md required")

        shutil.rmtree(self.project / ".workflow/runs")
        run_path, state = self.make_run(status="closed")
        (run_path / "result.md").unlink()
        self.assert_invalid("result.md")

    def test_unreferenced_malformed_approval_and_evidence_are_inspected(self):
        run_path, state = self.make_run()
        extra = run_path / "approvals/20260721T230030Z-closure.yaml"
        extra.write_text("invalid: [", encoding="utf-8")
        self.assert_invalid("invalid YAML")

        extra.unlink()
        (run_path / "evidence/not-immutable.md").write_text(
            "evidence", encoding="utf-8"
        )
        self.assert_invalid("immutable evidence filename")

    def test_event_filename_gate_and_reference_completeness(self):
        run_path, state = self.make_run()
        source = run_path / state["approval_refs"][0]
        target = run_path / "approvals/20260721T230010Z-closure.yaml"
        source.rename(target)
        state["approval_refs"][0] = str(target.relative_to(run_path))
        self.save_state(run_path, state)
        self.assert_invalid("filename gate mismatch")

        target.rename(source)
        state["approval_refs"].pop(0)
        self.save_state(run_path, state)
        self.assert_invalid("enumerate every immutable approval")

    def test_production_role_independence_and_attribution(self):
        run_path, state = self.make_run()
        state["roles"]["verifier"] = state["roles"]["implementer"]
        self.save_state(run_path, state)
        self.assert_invalid("verifier must be non-empty and independent")

        shutil.rmtree(self.project / ".workflow/runs")
        run_path, state = self.make_run(status="deployed", deployed=True)
        state["roles"]["release_approver"] = state["roles"]["implementer"]
        self.save_state(run_path, state)
        self.assert_invalid("release_approver must be non-empty and independent")

    def test_malformed_duplicate_yaml_and_missing_pyyaml_are_clear(self):
        current_path = self.project / ".workflow/current.yaml"
        current_path.write_text("active_run: [", encoding="utf-8")
        self.assert_invalid("invalid YAML")

        current_path.write_text(
            "schema_version: 1\n"
            "schema_version: 1\n"
            "active_run: null\n"
            "updated_at: '2026-07-21T22:38:41Z'\n"
            "repository_root: .\n",
            encoding="utf-8",
        )
        self.assert_invalid("duplicate key")

        existing = VALIDATE.yaml
        VALIDATE.yaml = None
        try:
            self.assert_invalid("PyYAML is required")
        finally:
            VALIDATE.yaml = existing


if __name__ == "__main__":
    unittest.main()
