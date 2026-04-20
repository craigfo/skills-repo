## Story: `upgrade` cycle on at least one project — update-channel validated

**Epic reference:** `../epics/e3-e2e-validation.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want to **run `skills-repo upgrade` on at least one of the two validation projects and have it re-fetch from upstream, diff against the lockfile, surface changes, and re-pin**,
So that **Risk 2 (non-fork adoption un-exercised by MVP because upgrade is deferred) is retired — the signature non-fork property is validated in its upgrade form, not just install**.

## Benefit Linkage

**Metric moved:** M5 (non-fork upgrade is the heart of non-fork — install without upgrade is a weaker claim), Risk 2 retirement.
**How:** Install proves non-fork adoption is *possible*. Upgrade proves it *stays* non-fork across upstream evolution. Upgrade also tests lockfile correctness, permanent-exclusion-list persistence through second-write events, and managed-merge behaviour on `architecture-guardrails.md`.

## Architecture Constraints

- **ADR-013** — hash operations go through the shared package.
- **Spike C addendum-1d** — managed-merge for `architecture-guardrails.md`; halt on consumer-ADR conflict.
- **C1 non-fork** — upgrade must not produce a git-clone-fork path; re-fetch + diff + re-pin only.
- **C2 POLICY.md floors** — `upgrade` propagates floors from upstream; no relaxation.
- **C4 human approval** — breaking-change signalling UX is deferred per discovery Out of Scope; upgrade in MVP handles non-breaking changes only. If a breaking change arrives mid-MVP, halt for operator review.

## Dependencies

- **Upstream:** v2-e2e-project1 (cycle 1 complete so project 1 has lived content to test upgrade against) OR v2-e2e-project2 (cycle 2 complete equivalently); one is sufficient per AC1.
- **Upstream:** An upstream change exists to upgrade to (a newer commit on `heymishy/skills-repo:master` relative to the project's pinned ref). If none exists, the story blocks on an upstream update.
- **Upstream:** `p4-enf-cli` upgrade command fleshed from stub (currently returns `{ status: 'ok' }`).
- **Downstream:** v2-docs-integration-guide documents the upgrade path.

## Acceptance Criteria

**AC1:** Given one validation project has completed at least one feature cycle and has a lockfile, When `skills-repo upgrade` runs against that project, Then the command re-fetches content at the `heymishy/skills-repo` HEAD (or the configured newer ref), computes a diff against the current lockfile, and presents the diff for operator review.

**AC2:** Given the operator confirms the upgrade, When `upgrade` re-pins, Then the new lockfile is committed to the sidecar with new SHA-256 pins for every changed file, and the upgrade commit has no accidental writes to the permanent-exclusion-list paths (verified by git diff).

**AC3:** Given `architecture-guardrails.md` has a consumer-authored `## ADR-NNN` block in the project, When `upgrade` runs and upstream has modified `architecture-guardrails.md` in a compatible way, Then the merge preserves the consumer ADR block and applies upstream additions elsewhere — managed-merge behaviour per Spike C addendum-1d.

**AC4:** Given `architecture-guardrails.md` has a consumer-authored ADR block that conflicts with an upstream change, When `upgrade` runs, Then upgrade halts, reports the conflict path, and does not commit or write to the sidecar; operator resolves manually.

**AC5:** Given the upgrade completes, When the operator runs the next `advance` in the ongoing feature cycle (if mid-cycle), Then the advance uses the newly-pinned content and the trace records the new skill hashes — no state corruption across upgrade boundary.

## Out of Scope

- Breaking-change upgrade UX — deferred per discovery Out of Scope.
- Auto-upgrade without operator review — prohibited (C4 human approval).
- Rollback from a completed upgrade — not an MVP behaviour; git revert is the mechanism.
- Upgrade on both projects — one is sufficient per story; second is operator discretion.

## NFRs

- **Audit:** Pre-upgrade and post-upgrade lockfile states both preserved in git history; diff is reviewable post-hoc.
- **Correctness:** POLICY.md floors are re-applied from upstream on next run (no stale floors from pre-upgrade).
- **Security:** No credentials in upgrade output or diff display (MC-SEC-02).

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — first exercise of the update channel; managed-merge edge-cases in particular may surface.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on v2-e2e-project1 or v2-e2e-project2 DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
