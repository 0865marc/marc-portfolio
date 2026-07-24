# Run kind

`implementation`

# Source implementation (release only)

Not applicable.

# Objective

Publish-ready Spanish blog content documenting the complete clean rebuild and secure installation of NousResearch Hermes Agent on a Hetzner Cloud VPS, using Codex for inference and an existing Telegram bot for remote tasks.

# Current behavior

The portfolio has three static sample articles. Its article model supports paragraphs and bullet points, but no semantic command blocks suitable for a step-by-step infrastructure tutorial.

# Desired behavior

The blog contains a real, searchable Hermes installation article with safe placeholders, structured command blocks, the security decisions made during the rebuild, and a canonical static route. The new article appears in the landing-page highlights and the full blog index.

# In scope

- Extend blog sections with optional command blocks and render them accessibly.
- Add the complete Spanish Hermes/Hetzner/Codex/Telegram article.
- Update the blog authoring contract and affected tests.
- Propose a bounded knowledge delta for the now-stale blog-domain summary.
- Run the complete repository verification gate.

# Out of scope

- Real VPS identifiers, IP addresses, SSH fingerprints, Telegram IDs, tokens, OAuth codes, API keys, or private transcripts.
- Redesigning the blog or changing route semantics.
- Installing Docker or granting Hermes root-equivalent Docker access.
- Commit, push, pull request, candidate publication, or production deployment.

# Constraints

- Preserve the existing Spanish editorial voice, accessible article structure, static route model, design tokens, and reduced-motion behavior.
- Keep implementation and production release as separate workflow runs.
- Reuse the current dark canvas and light article surface without adding new design tokens.

# Acceptance criteria

- `/blog/hermes-agent-hetzner-instalacion-segura/` is generated with unique metadata and complete content.
- The article covers destructive reset preparation, Hetzner firewall and rebuild, SSH identity handling, updates, separate admin and Hermes users, SSH hardening, Hermes installation and diagnosis, Codex OAuth, Telegram allowlisting, gateway persistence, and operational checks.
- Commands render as semantic, readable, horizontally contained code blocks.
- The new article is searchable, filterable, and visible in the landing highlights.
- Tests no longer assume the blog contains exactly three entries.
- `npm run verify` passes.

# Git, commit, push, and deployment policy

No Git mutation beyond working-tree edits is authorized in this implementation run. Commit, push, candidate publication, and production promotion remain denied and require later explicit workflow approvals.

# Sensitive-data rules

Do not record credentials, private logs, transcripts, request payloads, real infrastructure identifiers, or secrets. Use descriptive placeholders only.

# Essential questions

None. The user requested the complete process as a blog article and the repository defines the publication and design contracts.
