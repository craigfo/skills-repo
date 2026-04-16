## Test Plan: Apply `product/*` edits (roadmap + tech-stack + decisions ADR)

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.2-product-edits.md`
**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-2-governance-documents.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec2.2-product-edits-review-1.md` — PASS, 0 HIGH / 0 MEDIUM / 2 LOW. Review-1 L1 (AC1 could land 2-of-3 blocks and pass) is tightened here via three distinct unit checks rather than reopening the story.
**Reference source-of-truth:** `artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md` — section "Proposed `product/*` edits" (lines 103–180 at the time of writing).
**Test plan author:** Copilot (Claude Opus 4.6).
**Date:** 2026-04-17

---

## AC Coverage

Documentation story — three distinct file edits. AC1 is tightened at this layer by splitting into three block-presence checks (per review L1); ACs themselves are not reopened.

| AC   | Description                                                                                       | Unit | Integration | E2E | Manual     | Gap type | Risk |
|------|---------------------------------------------------------------------------------------------------|------|-------------|-----|------------|----------|------|
| AC1  | All three `product/*` edits land per 006's "Proposed `product/*` edits" section.                  | 3    | —           | —   | Scenario 1 | —        | 🟢 |
| AC2  | Commit message lists each file changed with a one-line summary.                                   | —    | —           | —   | Scenario 2 | Commit-message convention — not a committed file artefact | 🟢 |
| AC3  | The three target files are tracked by git after merge.                                            | 1    | —           | —   | —          | —        | 🟢 |

**Totals:** 4 unit checks, 0 integration, 0 NFR tests (story has no NFRs — "None identified — documentation only"), 2 manual scenarios.

**Tightening note (resolves review 1-L1):** Rather than treating AC1 as a single pass/fail (which would let 2-of-3 blocks slip through), the unit layer splits the check into three block-specific assertions. If any one block is missing or empty, the unit test fails — mapping 1:1 to the L1 reviewer concern without requiring an AC rewrite.

---

## Coverage gaps

| Gap | AC | Gap type | Reason untestable automatically | Handling |
|-----|----|----------|----------------------------------|----------|
| AC2 commit-message convention cannot be enforced by the test plan itself without a commit-msg hook. | AC2 | Convention (not artefact) | The test plan is evaluated against the branch tree, not the commit graph. | Scenario 2 — reviewer-checked at PR. Parallels ec2.1 AC2 handling. |
| Prose-level equivalence with 006 reference blocks is reviewer-judged. | AC1 (depth) | Reviewer-gated | "Follows the shape" is qualitative. A keyword-presence check catches stubs but not poor rephrasing. | Scenario 1 asks the reviewer to compare the landed prose side-by-side with 006's text blocks. |

---

## Test Data Strategy

**Source:** Synthetic — the only data is the content of three `product/*` files.
**PCI/sensitivity in scope:** No.
**Availability:** Available now — reference blocks are in `reference/006-engine-consolidation-proposal.md`.
**Owner:** Self-contained.

### Data requirements per AC

| AC   | Data needed                                                                                                              | Source                                          | Sensitive fields | Notes |
|------|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|------------------|-------|
| AC1  | Content of `product/roadmap.md`, `product/tech-stack.md`, `product/decisions.md` post-write.                             | The three files.                                | None             | Keyword-presence assertions per block. |
| AC2  | Commit message text at HEAD of the ec2.2 branch.                                                                         | `git log -1 --format=%B HEAD`.                  | None             | Reviewer-checked. |
| AC3  | `git ls-files product/roadmap.md product/tech-stack.md product/decisions.md` output.                                     | The git index post-commit.                      | None             | One-line shell check. |

### PCI / sensitivity constraints

None.

### Gaps

None.

---

## Unit Tests

Unit tests are implemented as a single node check script: `tests/check-product-edits.js` (or a vitest equivalent). Name and placement decided at implementation.

### Test: all three target files are tracked by git

- **Verifies:** AC3
- **Precondition:** Files have been committed on the ec2.2 branch.
- **Action:** `child_process.execSync('git ls-files product/roadmap.md product/tech-stack.md product/decisions.md').toString().trim().split('\n')`.
- **Expected result:** Output has exactly 3 lines — `product/roadmap.md`, `product/tech-stack.md`, `product/decisions.md`. Missing any line = test failure.
- **Edge case:** No.

### Test: `product/roadmap.md` contains the Productisation-thread section

- **Verifies:** AC1 (block 1 of 3)
- **Precondition:** `product/roadmap.md` has been amended.
- **Action:** Read file content. Assert three anchor phrases all present (case-sensitive for headings, case-insensitive for body): the heading `## Productisation thread` (or equivalently `# Productisation thread` if using top-level), the phrase `distribution outcome` (from 006's text block), and the reference path `artefacts/2026-04-15-productise-cli-and-sidecar/`.
- **Expected result:** All three anchors present. Missing the heading or the reference path is a block-missing failure.
- **Edge case:** The date in the heading (`started 2026-04-15`) is flexible — the regex uses `Productisation thread` as the anchor, not the date.

### Test: `product/tech-stack.md` contains the Engine-layout section with a CLI tree

- **Verifies:** AC1 (block 2 of 3)
- **Precondition:** `product/tech-stack.md` has been amended.
- **Action:** Read file content. Assert all of these anchor tokens are present:
  - The heading `## Engine layout` (or equivalent — `# Engine layout` acceptable).
  - The path token `cli/src/commands/` (structural signal the tree-diagram landed).
  - The path token `cli/src/engine/`.
  - The path token `cli/src/adapters/`.
  - The path token `cli/src/agents/`.
  - The word `DEPRECATED` (marking the `src/` row in the tree).
- **Expected result:** All six anchors present.
- **Edge case:** The tree diagram uses box-drawing characters (`├──`, `└──`, `│`) in the 006 reference. Tests should **not** require those literal characters — they're stylistic. Path strings are the real content signal.

### Test: `product/decisions.md` contains the CLI-control-plane ADR

- **Verifies:** AC1 (block 3 of 3)
- **Precondition:** `product/decisions.md` has been amended.
- **Action:** Read file content. Assert all of these anchor phrases present:
  - An ADR heading matching the regex `/ADR-\d+:?\s*CLI is the single authoritative control plane/i` (accepts `ADR-001`, `ADR-011`, `ADR-00X`, etc. — the numeric ID is operator-assigned at landing time; the phrase after the colon is the anchor).
  - The substring `Status: Accepted` (or `**Status:** Accepted`).
  - The substring `single codebase` or `single authoritative` (rationale-content signal).
  - The substring `Move-only` (captures the migration-scope commitment).
- **Expected result:** All four anchors present.
- **Edge case:** The 006 reference uses `ADR-00X` as a placeholder. At landing, the operator will replace `X` with the next ADR number in the file. The regex permits any digit(s) in that position.

---

## Integration Tests

None. Three independent documentation edits — no component seams.

---

## NFR Tests

The story states: "None identified — documentation only."

No NFR tests written — confirmed against the story's NFR block.

---

## Out of Scope for This Test Plan

- **Prose quality, tone, style of the three edits.** Reviewer-checked at `/review` (already complete).
- **Narrative equivalence between landed prose and 006's reference blocks.** Keyword-presence catches stubs; reviewer confirms the prose *says what 006 says* at PR.
- **Changes to `product/mission.md` or `product/constraints.md`.** Explicitly out-of-scope per story (protected by C4 / C13).
- **Future roadmap entries beyond the current Productisation-thread paragraph.** Out of scope per story.

---

## Test Gaps and Risks

| Gap | Reason | Mitigation |
|-----|--------|------------|
| AC2 commit-message convention is not enforced by the test plan. | Commit messages are not artefact content. | Scenario 2 prompts the reviewer at PR. |
| Keyword-presence is a necessary but not sufficient check — a block could land with the right anchors but wrong prose. | "Follows the shape" is qualitative; automated checks anchor on keyword tokens. | Scenario 1 asks the reviewer to side-by-side the landed prose with 006's text blocks. Review already signed off once; any divergence introduced at implementation would be caught at `/verify-completion` or DoD. |
| The ADR number in `product/decisions.md` is operator-chosen at landing time and cannot be pre-asserted. | The next ADR ID depends on what else has landed in `decisions.md`. | Regex `/ADR-\d+/` accepts any numeric; the anchor is the phrase, not the ID. |
