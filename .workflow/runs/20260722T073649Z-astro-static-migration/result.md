# Status

Partial/Blocked.

# Summary

The approved Astro static migration, mandatory comparison prototypes, reproducible Lighthouse harness, operations/static-host checks, and pending knowledge delta are implemented in the isolated feature worktree. Static, Chromium, Firefox, accessibility, controlled Lighthouse, and Nginx gates pass. Independent verification found repeated failures in the required pinned WebKit route/history/new-tab/ten-navigation case, so the browser hard gate and production-readiness claim do not pass.

# Git and release boundary

Scoped local commits are permitted. Push, deployment, publishers, production changes, and system Nginx changes remain forbidden and did not occur. The supervising agent owns independent verification and the external task result.

# Decisions

Framework-free filtering wins over the temporary React island on shipped bytes while preserving tested SSR semantics and behavior. Native cross-document transitions win over ClientRouter on bytes, route-heading focus, and listener lifecycle.

# Verification

See `evidence/20260722T084300Z-completion-validation.md` for implementation measurements and `evidence/20260722T085508Z-independent-verification.md` for the independent pass/fail disposition.

# Residual risk

Pinned WebKit automation is not green; physical Safari was unavailable. Unchanged remote landing images are externally controlled and produced very large, variable full-media transfers. No field INP is claimed.

# Blocker

Resolve and independently rerun the pinned WebKit route/history/new-tab/ten-navigation matrix. A failed required browser gate cannot be waived without a new scoped approval.
