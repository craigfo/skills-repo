## Story: Apply `product/*` edits (roadmap + tech-stack + decisions ADR)

**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-2-governance-documents.md`
**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`

## User Story

As the **productisation-thread contributor**,
I want to **land the three `product/*` edits per the 006 proposal**,
So that **the roadmap names the Productisation thread, tech-stack reflects the single-`cli/` engine layout, and decisions.md carries the control-plane ADR**.

## Benefit Linkage

**Metric moved:** M3 (CONTRIBUTING.md + product/* landed) — partial (one file or set).
**How:** This story adds one or more of the four files M3 counts.

## Architecture Constraints

None identified — checked against `.github/architecture-guardrails.md`. Documentation-only.

## Dependencies

- **Upstream:** None.
- **Downstream:** Aggregate feature DoD (M3).

## Acceptance Criteria

**AC1:** Given the feature branch, When the operator creates / amends the file(s) described in "Out of Scope" and "User Story" above, Then the file contents follow the shape described in `reference/006-engine-consolidation-proposal.md` (for CONTRIBUTING.md — Part 2; for product/* edits — the literal text blocks in the proposal's "Proposed `product/*` edits" section).

**AC2:** Given AC1 completed, When the operator commits, Then the commit message lists each file changed with a one-line summary.

**AC3:** Given the feature branch merges into `develop`, When `git ls-files` is checked for the target file path(s), Then the file(s) are present.

## Out of Scope

- **Altering any other `product/*` file** (mission.md, constraints.md). Not part of this story; constraints especially are protected by C4 / C13.
- **Changes to standards files.** Separate governance domain.
- **Future productisation roadmap entries beyond the current Productisation thread paragraph.** When 005 Gates or new productisation-thread features land, they amend the roadmap then; this story establishes the initial paragraph.

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
