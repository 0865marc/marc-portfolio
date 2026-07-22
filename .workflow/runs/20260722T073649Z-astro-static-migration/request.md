# Objective

Implement the approved Astro 7 static migration for marc-portfolio from the clean rollback baseline `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed` in this isolated worktree.

# Current behavior

React 18, ReactDOM, and Vite provide a single-root hash-routed SPA. Hash routes select the landing page, blog index, and three statically typed Spanish articles. Framer Motion supplies several effects. Nginx serves static Vite output through timestamped releases, and the existing GitHub push webhook invokes the production build/deploy script.

# Desired behavior

Astro static output with real canonical routes, meaningful build-time HTML, minimal client JavaScript, framework-free filtering unless measured evidence requires a React island, progressive motion/focus/hash compatibility, native view transitions unless evidence requires Astro ClientRouter, direct article URLs, designed real 404 behavior, and continued static Nginx hosting.

# In scope

- Work only on branch `feat/astro-static-migration` in the current repository root.
- Generate `/`, `/blog/`, each known `/blog/<id>/`, and `/404.html`.
- Preserve Spanish content, visual tokens, accessibility, route focus, reduced motion, image fallbacks, anchors, and legacy hashes.
- Implement both bounded filter prototypes and both transition prototypes, measure them, retain the winner, and completely remove losers.
- Add static, unit, browser, accessibility, Nginx-fixture, deployment-check, asset, and Lighthouse validation.
- Update only the application, test, operations, documentation, workflow, and pending knowledge-delta files enumerated by the approved plan.
- Create validated scoped local commits after all applicable gates pass.

# Out of scope

Production cutover, any push, deployment, publisher execution, system Nginx changes, DNS, secrets, production data, webhook configuration, runtime application servers, authored `.agents` knowledge, generated knowledge indexes, and the supervising Dev agent's external `result.md`.

# Constraints

Preserve the production checkout and rollback baseline. Preserve unrelated work. Never reset, clean, stash, force-push, deploy, or invoke production operations. Use the existing detached baseline worktree for reproducible comparisons. Stop and record honest Partial/Blocked evidence if a hard gate fails or required browser provisioning cannot execute.

# Acceptance criteria

All static rendering, route/history, filter/accessibility, design/motion/browser, build/performance, and operations acceptance criteria in `plan.md` are binding, including the exact route inventory; usable no-JS content; Chromium/Firefox/WebKit plus mobile, JS-off, and reduced-motion coverage; exact filtering semantics; real Nginx-equivalent 404; two fresh locked builds; JS and performance budgets; and documented first-/third-party benchmark modes.

# Git, commit, push, and deployment policy

Local scoped commits on `feat/astro-static-migration` are explicitly authorized after validation. `push_allowed` is false. No remote push or deployment is authorized. Production release requires later independent verification and separate exact approvals. Rollback remains the known-good baseline commit.

# Sensitive-data rules

Do not record credentials, private logs, transcripts, request payloads, production secrets, or sensitive production data. Workflow evidence must remain concise and redacted.

# Essential questions

No product question blocks isolated implementation. Production release remains blocked on a separately authorized, Certbot-preserving Nginx activation mechanism and exact deployment approval.
