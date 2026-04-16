## Story: Migrate src/bitbucket-dc-validator/ → cli/src/adapters/bitbucket/dc/

**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-1-subcomponent-migrations.md`
**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`

## User Story

As the **productisation-thread contributor**,
I want to **move `src/bitbucket-dc-validator/` into `cli/src/adapters/bitbucket/dc/` with its tests co-located**,
So that **this subcomponent is structurally owned by the CLI (MM1) and Phase 3 contributors aren't invoking it from outside the CLI boundary (M1).**

## Benefit Linkage

**Metrics moved:** M1 (migration completeness), M2 (pre/post test invariant), M4 (host-repo cleanliness, partial — one subcomponent's contribution), MM1 (control-plane principle realised, partial).
**How:** A move-only refactor with tests co-located enforces the control-plane principle structurally for this subcomponent. Pre/post test-count + pass-rate invariant confirms no behaviour change.

## Architecture Constraints

- **MC-CLI-01** — CLI writes confined to `.skills-repo/` or `artefacts/` at runtime. This story is build-time code layout, not runtime; MC-CLI-01 honoured by default.
- **AP-11 (upstream guardrail)** — artefact-first policy: new SKILL.md / `src/` modules / governance scripts require a story artefact. This story IS the artefact; migration doesn't create new src/ modules (moves existing ones into cli/).
- **ADR-011 (upstream)** — same artefact-first policy. Honoured.
- No other guardrails apply.

## Dependencies

- **Upstream:** None. Each of the 7 migration stories is independent; they may proceed in parallel per `/decisions` Q1.
- **Downstream:** Aggregate feature DoD (M4, MM1, MM2 measurements).

## Acceptance Criteria

**AC1:** Given the current HEAD of `develop` as the baseline, When the operator captures a test-count + pass-rate snapshot by running the tests that currently cover this subcomponent (`tests/check-bitbucket-dc.js, check-bitbucket-dc-auth.test.js (571 LOC total)`), Then the snapshot is recorded in this story's DoD artefact in a `pre-migration-tests` block with: (a) numeric test count, (b) pass rate, (c) exact test names.

**AC2:** Given the pre-migration snapshot exists (AC1), When the operator moves `src/bitbucket-dc-validator/` (including subfiles: index.js) into `cli/src/adapters/bitbucket/dc/` via `git mv` (or equivalent preserving git history), Then every file appears at the new path and `src/bitbucket-dc-validator/` contains 0 `.js` / `.ts` files.

**AC3:** Given AC2 completed, When the operator moves the accompanying test files (`tests/check-bitbucket-dc.js, check-bitbucket-dc-auth.test.js (571 LOC total)`) into `cli/tests/adapters/bitbucket/dc/`, Then the test files appear at the new path, their original location is empty of these files, and any imports inside the moved tests referencing `src/bitbucket-dc-validator/` are updated to the new path.

**AC4:** Given AC2+AC3 completed, When the operator runs a repo-wide grep for references to the old path (`grep -r "src/bitbucket-dc-validator" . --exclude-dir=.git --exclude-dir=node_modules`), Then the only matches are in documentation / decisions.md / discovery.md / changelog narrative (not executable code or imports).

**AC5:** Given AC2–AC4 completed, When the operator runs the same tests captured in AC1 (now at their new location), Then test count and pass rate match the pre-migration snapshot exactly. Any drift blocks the PR.

**AC6:** Given AC5 passes, When the operator commits and opens the PR, Then the PR description includes the pre-migration snapshot (AC1) and post-migration snapshot (AC5) side by side as evidence of the move-only invariant.

## Out of Scope

- **Any behaviour change** to this subcomponent. Interfaces preserved exactly. New capabilities wait for a follow-up feature.
- **Rewriting tests** for readability or modernisation. Tests move verbatim; any cleanup is a separate feature.
- **Updating SKILL.md / standards content** that references this subcomponent. Those references (if any) stay accurate because the CLI provides a stable external API shape.
- **`.github/scripts/` collapse beyond this story's co-located test file.** Per `/decisions` Q3 deferral.

## NFRs

- **Performance:** Test execution time should not materially change (moving test locations doesn't alter runtime). Any significant slowdown is a signal of implicit coupling drift.
- **Security:** No new credential handling, no new external calls, no new file writes outside `cli/`. Move-only.
- **Accessibility:** N/A (non-UI).
- **Audit:** `git log --follow` on moved files should still show the original history. `git mv` preferred over delete+add for this reason.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable
**Note:** Two test files (base + Docker-gated auth). Both move together.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
