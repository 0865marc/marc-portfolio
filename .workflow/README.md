# Project-local workflow contract

This directory defines prospective, project-relative execution records. It does not migrate or assert the truth of retired task history. `.workflow/` holds per-run requests, plans, state, immutable approvals, evidence, results, and archives; reviewed reusable knowledge belongs in `.agents/` through a pending knowledge delta and independent review. `.workflow/` is excluded from CodeGraph, and its ignored `.codegraph/` database is never a workflow artifact or source of authority.

`policy.yaml` is the source of truth for lifecycle states and transitions, required roles and gates, artifact obligations, concurrency, and retired paths. The validator reads those values and supplies the closed schema plus safety semantics it can actually prove. Accepted predecessor policy hashes preserve historical execution bindings without treating an old policy as current authority.

## Run lifecycle

Create an immutable UTC run ID (`YYYYMMDDTHHMMSSZ-short-kebab-slug`) and copy the templates into `.workflow/runs/<run-id>/`. Record discovery and planning, calculate the exact `plan.md` SHA-256, then obtain an attributable immutable plan approval. `.workflow/current.yaml` identifies the run currently in focus; other non-terminal runs may coexist when they concern independent work.

Record every state change in `state.yaml` with `from`, `to`, true UTC `at`, `by`, a reason, and a nullable `resume_state`. A transition into `blocked` records the intended non-terminal resume state both on that transition and in current blocker metadata. The only exits from `blocked` are that exact recorded state, `cancelled`, or `failed`. Changed scope or plan returns to planning and needs a new digest approval. Approval records never override higher authority.

Execution begins only after effective plan and execution-start approvals bound to the current plan and scope. The `execution_start` approval `evidence` list is a closed, deterministic six-item representation, in this exact order: `repository_root=.`, `branch=<branch>`, `baseline_head=<40-char SHA>`, `pre_existing_changes_sha256=<digest>`, `policy_sha256=<digest>`, and `plan_sha256=<digest>`. The pre-existing-changes digest is SHA-256 over the UTF-8 bytes of its JSON array serialized with `ensure_ascii=true`, sorted keys, and compact separators (equivalent to Python `json.dumps(value, sort_keys=True, separators=(',', ':'))`). The policy digest is recomputed from the exact bytes of `.workflow/policy.yaml`. Verification records real commands, results, acceptance disposition, failures and limitations, independently attributable from implementation in production. Gate obligations are durable: they are based on the highest lifecycle phase ever reached, even if the current state is blocked, failed, or cancelled. Closure requires its own effective approval. The latest event for a gate and scope is effective, so a later rejection or revocation cancels an older approval. `deployed` is not the same as verified or closed.

An implementation run ends after independent verification and closure; lack of deployment authority is not an implementation blocker. Production work starts in a distinct release run that references the closed implementation result and exact commit in its request and plan. This keeps implementation history immutable and allows release preparation to wait without serializing unrelated work.

An approved push to `origin/main` inherently triggers production deployment through the GitHub push webhook. Such a push is invalid unless the release run is `ready_for_release` and has a single-use deployment approval bound to the exact artifact digest, commit, `origin/main` target, `production` environment, and `github_push_webhook` trigger. On any deployed path, `state.git` must allow commit and push, carry the identical deployment commit, and target `origin/main`. Manual deployment, inferred permission, force-push, reset, clean, and stash are forbidden. Post-deploy evidence is required before deployed closure.

Terminal states are `closed`, `failed`, and `cancelled`. They require `result.md` and cannot transition. After successful destination validation, move the intact directory to `.workflow/archive/<YYYY>/<run-id>/` without overwrite, then clear the current pointer.

## Validate

```sh
python3 .workflow/scripts/validate.py --project .
python3 .workflow/scripts/validate.py --project . --run <run-id>
python3 .workflow/scripts/validate.py --project . --include-archive
python3 -m unittest discover -s .workflow/tests -p 'test_*.py' -v
```

Validation is read-only, scans actual filesystem entries (including ignored files), and emits JSON. Records must contain no credentials, private logs, transcripts, request payloads, or production secrets; use concise redacted evidence.
