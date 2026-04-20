## Story: Pre-install collision detection protects operator-authored content

**Epic reference:** `../epics/e1-install-exclusion.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want **`init` to run a pre-flight check against the target repo before writing anything**,
So that **any collision between managed paths and operator-authored content is surfaced and halts the install — no silent overwrites, no partial installs**.

## Benefit Linkage

**Metric moved:** M5 — Non-fork adoption (defence-in-depth against exclusion-list drift). Risk 8 mitigation — permanent-exclusion list drift surfaced as tested rather than trusted.
**How:** The hardcoded permanent-exclusion list protects consumer-owned paths, but a pre-flight check also verifies that managed paths don't collide with operator-authored content before any write happens. Catches configuration errors (e.g. operator has extra files at a managed path) at install time, not at upgrade time when content is already in conflict.

## Architecture Constraints

- **Spike C addendum-1d** — permanent-exclusion list is always honoured; this story adds the *pre-flight* collision check on top of the permanent exclusion.
- **ADR-004** — `managed_paths` and `skills_upstream.extra_exclusions` read from `.github/context.yml`; collision check uses that configuration.
- **C1 non-fork** — collision at a managed path means the consumer would need to fork to resolve; the check surfaces this as a configuration decision rather than a silent install failure.

## Dependencies

- **Upstream:** v2-install-init runs the actual install (after pre-flight passes). This pre-flight is part of `init`'s flow.
- **Upstream:** v2-install-sidecar-lockfile defines the lockfile shape used to recognise "already initialised" state.
- **Downstream:** All Epic 3 stories depend on this check succeeding on their target project.

## Acceptance Criteria

**AC1:** Given project 1 has no existing sidecar and no operator-authored files at any managed path, When `skills-repo init` runs, Then the pre-flight check passes and install proceeds — exit 0.

**AC2:** Given project 1 has an operator-authored file at a managed path (e.g. `.github/skills/my-custom-skill/SKILL.md` where `.github/skills/` is a managed path), When `init` runs, Then the pre-flight check fails before any write happens; the command exits non-zero; the error message names each colliding path and the managed-paths entry that owns it.

**AC3:** Given the operator has configured `skills_upstream.extra_exclusions` in `context.yml` to cover a subset of managed paths, When `init` runs, Then paths matched by `extra_exclusions` are NOT materialised in the sidecar, and the lockfile notes them as `excluded` with the reason.

**AC4:** Given a pre-flight check fails, When the error message is emitted, Then it includes actionable guidance: which paths collide, which option resolves each (remove the collision, add to `extra_exclusions`, or install in a different location).

**AC5:** Given project 1 is already initialised (lockfile present in the sidecar), When `init` runs, Then pre-flight reports "already initialised" and exits non-zero without running the full collision check (AC4 of v2-install-init path also applies).

## Out of Scope

- Auto-resolution of collisions — out of MVP; operator manually resolves.
- Partial install recovery if a write fails mid-flow — out of MVP; install is all-or-nothing.
- Custom collision-handling hooks — out of MVP.

## NFRs

- **Performance:** Pre-flight completes in under 2 seconds for a typical repo (≤1000 files on the path whitelist).
- **Correctness:** Every collision is reported exactly once; no duplicates, no false positives from glob-pattern ambiguity.
- **Security:** Pre-flight reads file paths only, not contents — no risk of credential exposure in collision messages (MC-SEC-02).

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable — pre-flight is well-scoped; edge-cases are around glob-pattern matching and `extra_exclusions` semantics, both bounded.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (Medium)
