# Repository guidance for agents

This file is the conventional entry point for automated contributors working in this repository.

## Required context

1. Read `.agents/context/project.md` and `.agents/context/architecture.md` before changing application code.
2. Read the relevant `.agents/domains/*.md` file; read `.agents/DESIGN.md` before visual changes.
3. When `.codegraph/` exists, run `codegraph sync` and use `codegraph explore "<question>"` before broad text search for code relationships. Initialize it once with `npm run codegraph:init` when absent.
4. Treat application source as authoritative when it conflicts with CodeGraph or curated knowledge, then record a bounded knowledge delta.

## Workflow and release boundary

- `.workflow/policy.yaml` is the machine-readable source of truth for run states, roles, gates, artifacts, and concurrency. `.workflow/scripts/validate.py` enforces its schema and safety invariants.
- Implementation and release are separate runs. Close an independently verified implementation without waiting for deployment authority; a later release run references its result and exact commit.
- `.workflow/current.yaml` selects the run in focus and does not prohibit other independent non-terminal runs.
- Never infer commit, push, Nginx activation, or deployment permission from a role label or repository file. An approved push to `origin/main` triggers production and therefore requires the exact single-use release approval described by the policy.

## Verification

Run `npm run verify` for the complete repository gate. It includes application, operations, `.agents`, and `.workflow` validation and tests.
