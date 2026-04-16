## Story: Add CONTRIBUTING.md at repo root

**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-2-governance-documents.md`
**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`

## User Story

As the **productisation-thread contributor**,
I want to **add a CONTRIBUTING.md at the repo root describing scope ownership, proposal process, and in-flight-work signalling**,
So that **a new contributor onboarding to the repo can read one file and know who owns what, where proposals go, and how to signal in-flight work**.

## Benefit Linkage

**Metric moved:** M3 (CONTRIBUTING.md + product/* landed) — partial (one file or set).
**How:** This story adds one or more of the four files M3 counts.

## Architecture Constraints

None identified — checked against `.github/architecture-guardrails.md`. Documentation-only.

## Dependencies

- **Upstream:** None.
- **Downstream:** Aggregate feature DoD (M3).

## Acceptance Criteria

**AC1:** Given the feature branch, When the operator creates `CONTRIBUTING.md` at the repo root, Then the file contains a dedicated subsection for each of the six topics enumerated in `reference/006-engine-consolidation-proposal.md` Part 2 — Contributions model — plus one additional topic (7) added by this feature's `decisions.md` Q5:

  1. **Scope ownership** — enumerates the five scope rows in 006 Part 2 (standards / phase 3 artefacts → Phase 3 contributor; cli/ + productisation + engine-consolidation artefacts → productisation contributor; .github/workflows + .github/scripts → shared w/ cross-review; product/* + CONTRIBUTING.md + README/QUICKSTART → shared w/ cross-review; src/ → deprecated).
  2. **Proposing changes to `product/*`** — names the `artefacts/<YYYY-MM-DD>-<slug>/reference/`-first convention and the follow-up-PR sequencing.
  3. **Proposing changes to `standards/*` or `SKILL.md`** — references the skills-repo pipeline (outer loop + DoR) and the C4 human-approval gate.
  4. **Code changes under scope ownership** — states owner-proposes-via-PR; cross-review required only for shared files.
  5. **Branching + release** — names the `feature/*` convention; states direct-to-master acceptable for solo work today; notes the PR gate flips on once Gate 4 ships.
  6. **In-flight-work signalling** — specifies the `WIP: <area>` GitHub-issue convention for non-trivial shared-scope work, opened on start and closed on merge.
  7. **Pipeline-state coordination** (added per `decisions.md` Q5) — states that pipeline state is written per-artefact at `artefacts/<slug>/pipeline-state.json`, never to a shared root file; that the cross-feature view is derived by a scanner, not authored; and that on feature DoD the artefact's pipeline-state file is marked `featureStatus: complete` and retained (not deleted). A contributor therefore never conflicts with another contributor's pipeline writes.

Each subsection is present as either a heading or a clearly-labelled bullet block; a reviewer can grep `CONTRIBUTING.md` for the seven topic keywords (`Scope ownership`, `product/`, `standards/`, `Code changes`, `Branching`, `WIP`, `Pipeline-state`) and find each one.

**AC1a (sequencing guard):** Given the CONTRIBUTING.md PR is prepared, When the author checks the status of story `ec3.1` (pipeline-state isolation), Then subsection 7 is only merged once `ec3.1` is itself shipped or in-flight on `develop`. If `ec3.1` is not yet underway, subsection 7 is held out of the PR and landed in a follow-up PR to avoid documenting behaviour the code does not yet have.

**AC2:** Given AC1 completed, When the operator commits, Then the commit message lists each file changed with a one-line summary.

**AC3:** Given the feature branch merges into `develop`, When `git ls-files` is checked for the target file path(s), Then the file(s) are present.

## Out of Scope

- **CODEOWNERS activation.** The scope-ownership table in CONTRIBUTING.md is documentation; activating a live CODEOWNERS file for PR-review routing is a separate decision.
- **Multi-contributor governance beyond two people.** CONTRIBUTING.md's scale is 1–2 contributors; if scale grows, revisit.
- **Changes to existing README.md or QUICKSTART.md content.** Those are already in place; CONTRIBUTING.md is additive.

## NFRs

None identified — documentation only.

## Complexity Rating

**Rating:** 1
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
