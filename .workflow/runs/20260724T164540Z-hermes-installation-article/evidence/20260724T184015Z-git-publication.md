# Acceptance scope

Record the explicitly authorized commit and non-force push outcome for the validated Hermes installation article.

# Commands and real results

- `git commit -m "feat(blog): document Hermes setup on Hetzner"`: exit 0; created commit `349f69fb400fc93e50497ee024003e0243e12851` with the 13 approved files.
- `git push origin main`: exit 1; GitHub branch protection rejected the direct update because changes to `main` must use a pull request.
- `git push origin HEAD:refs/heads/blog/hermes-installation-article`: exit 0; created the remote feature branch without force.
- `git ls-remote --heads origin blog/hermes-installation-article`: exit 0; the remote branch resolved to `349f69fb400fc93e50497ee024003e0243e12851`.

# Diff observations

The committed content matches the previously validated implementation. No source changes were introduced while adapting the push destination to branch protection.

# Failures, skips, and limitations

- The direct `main` push was not retried or bypassed.
- No pull request, merge, image promotion, or production deployment was performed.

# Artifact and target identity

- Implementation commit: `349f69fb400fc93e50497ee024003e0243e12851`
- Successful push target: `origin/blog/hermes-installation-article`
- Protected merge target: `origin/main`

# Conclusion

The implementation commit is available on the remote feature branch and is ready for a separately authorized pull request and independent verification.
