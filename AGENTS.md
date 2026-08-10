# Repository guidance for agents

This file is the conventional entry point for automated contributors working in this repository.

## Required context

1. Read `.agents/context/project.md` and `.agents/context/architecture.md` before changing application code.
2. Read the relevant `.agents/domains/*.md` file; read `.agents/DESIGN.md` before visual changes.
3. Treat application source as authoritative when it conflicts with curated knowledge, then record a bounded knowledge delta.

## Release boundary

- Implementation and release are separate concerns. Close an independently verified implementation without waiting for deployment authority; a later release process references its result and exact commit.
- Never infer commit, push, or deployment permission from a role label or repository file. A merge to `main` verifies and publishes a GHCR candidate; it never deploys production. Production promotion is a separate private operation bound to an explicitly approved image digest.

## Verification

Run `npm run verify` for the complete repository gate. It includes application, operations, and `.agents` validation and tests.
