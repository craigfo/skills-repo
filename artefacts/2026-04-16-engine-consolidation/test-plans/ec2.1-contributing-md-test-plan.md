## Test Plan: Add CONTRIBUTING.md at repo root

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-2-governance-documents.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec2.1-contributing-md-review-2.md` (run 2) — PASS, 0 HIGH / 0 MEDIUM / 3 LOW. Review-1 MEDIUM was resolved in-story during review-2.
**Test plan author:** Copilot (Claude Opus 4.6).
**Date:** 2026-04-17

---

## AC Coverage

Documentation story — "tests" are structural content assertions (file presence, keyword presence, subsection completeness) + a procedural sequencing guard that is reviewer-checked.

| AC   | Description                                                                                                        | Unit | Integration | E2E | Manual     | Gap type | Risk |
|------|--------------------------------------------------------------------------------------------------------------------|------|-------------|-----|------------|----------|------|
| AC1  | `CONTRIBUTING.md` contains 7 named subsections, each with the required content.                                    | 3    | —           | —   | Scenario 1 | —        | 🟢 |
| AC1a | Subsection 7 (pipeline-state coordination) is only merged if `ec3.1` is in-flight on `develop` or already shipped. | —    | —           | —   | Scenario 2 | Reviewer-gate check — depends on cross-story state at PR time | 🟡 |
| AC2  | Commit message lists each file changed with a one-line summary.                                                    | —    | —           | —   | Scenario 3 | Commit-message convention — not a committed file artefact | 🟢 |
| AC3  | `CONTRIBUTING.md` is tracked by git (`git ls-files` returns the path).                                             | 1    | —           | —   | —          | —        | 🟢 |

**Totals:** 4 unit checks, 0 integration, 0 NFR tests (story has no NFRs — "None identified — documentation only"), 3 manual scenarios. AC1a marked 🟡 because it is a sequencing gate, not a content defect — the risk is that subsection 7 ships before ec3.1's behaviour exists.

---

## Coverage gaps

| Gap | AC | Gap type | Reason untestable automatically | Handling |
|-----|----|----------|----------------------------------|----------|
| AC1a sequencing depends on the state of a separate story (`ec3.1`) at PR merge time. | AC1a | Reviewer-gate check | An automated test on ec2.1's branch cannot know whether ec3.1 has shipped or is in-flight on `develop` unless it queries GitHub/git state. That check shifts from "test the artefact" to "test cross-repo-state at PR time." Cheaper to make it a reviewer prompt. | Scenario 2 in verification script; also surface at `/review` of ec2.1's PR — reviewer blocks or green-lights subsection 7 based on ec3.1 status. |
| AC2 commit-message convention cannot be enforced by the test plan itself without a commit-msg hook. | AC2 | Convention (not artefact) | The test plan is evaluated against the branch tree, not the commit graph. Checking the commit message is a CI-lint / hook territory. | Scenario 3 — reviewer-checked at PR. A follow-up could add a commit-msg lint, but that is out of scope per AC. |

---

## Test Data Strategy

**Source:** Synthetic — the only data is the content of `CONTRIBUTING.md` itself plus the repo file tree (for AC3's `git ls-files`).
**PCI/sensitivity in scope:** No.
**Availability:** Available now.
**Owner:** Self-contained.

### Data requirements per AC

| AC   | Data needed                                                                               | Source                          | Sensitive fields | Notes |
|------|-------------------------------------------------------------------------------------------|---------------------------------|------------------|-------|
| AC1  | Content of `CONTRIBUTING.md` (headings, bullet labels, subsection bodies).                | The file at repo root, post-write. | None            | Tested by grep + heading extraction. |
| AC1a | State of story `ec3.1` at PR merge time (shipped / in-flight / not-started).              | `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md` state + `.github/pipeline-state.json` + git branch listing on `develop`. | None | Reviewer-observed at PR. |
| AC2  | Commit message text at HEAD of the ec2.1 branch.                                           | `git log -1 --format=%B HEAD`.  | None            | Reviewer-checked. |
| AC3  | `git ls-files CONTRIBUTING.md` output.                                                     | The git index post-commit.      | None            | One-line shell check. |

### PCI / sensitivity constraints

None.

### Gaps

None.

---

## Unit Tests

Unit tests are implemented as a single node check script: `tests/check-contributing-md.js` (or a vitest equivalent under `cli/tests/docs/`). Name and placement decided at implementation — the intent below is framework-independent.

### Test: `CONTRIBUTING.md` exists and is tracked by git

- **Verifies:** AC3
- **Precondition:** File has been committed on the ec2.1 branch.
- **Action:** `child_process.execSync('git ls-files CONTRIBUTING.md').toString().trim()`.
- **Expected result:** Output is exactly `CONTRIBUTING.md`. Empty output = file not tracked = test failure.
- **Edge case:** No. Either git tracks it or it doesn't.

### Test: `CONTRIBUTING.md` contains all seven required topic markers

- **Verifies:** AC1 (structural)
- **Precondition:** `CONTRIBUTING.md` written.
- **Action:** Read file content; for each of the seven required keyword markers — `Scope ownership`, `product/`, `standards/`, `Code changes`, `Branching`, `WIP`, `Pipeline-state` — assert at least one match is present, and each match is within a heading line (`^#`) or a bullet label line (`^\s*[-*]\s+\*\*`).
- **Expected result:** Exactly 7 (or more — duplicates allowed) distinct topic markers found, each qualifying as a heading or bolded bullet label.
- **Edge case:** A keyword appearing only in prose (not as a heading or bullet label) does not satisfy the AC. Example: the word "branching" in a sentence like "…avoid branching from master…" must not be counted. The regex for bullet-label uses `\*\*` (bolded) so bare-prose matches fall through.

### Test: scope-ownership subsection enumerates all five scope rows

- **Verifies:** AC1 (content depth — subsection 1)
- **Precondition:** Previous test passed (`Scope ownership` heading present).
- **Action:** Extract the content block under the `Scope ownership` heading (up to the next heading at the same or higher level). Within that block, assert all five scope markers are present: `standards`, `phase 3`, `cli/`, `productisation`, `engine-consolidation`, `.github/workflows`, `.github/scripts`, `product/`, `README`, `QUICKSTART`, `src/` (deprecated). A looser formulation: the block must name at least 5 of these 11 scope tokens — a valid enumeration of the 5 scope rows cannot avoid referencing most of them.
- **Expected result:** ≥ 5 of the 11 scope tokens are present within the `Scope ownership` block.
- **Edge case:** The AC is tolerant of phrasing — "docs for `product/`" satisfies the same as "changes to `product/*`". The regex uses literal substrings, not word boundaries.

### Test: pipeline-state subsection (topic 7) mentions the required structural points

- **Verifies:** AC1 (content depth — subsection 7)
- **Precondition:** `Pipeline-state` heading present.
- **Action:** Extract the content block under the `Pipeline-state` heading. Assert all three required phrases are present (case-insensitive substring match): `per-artefact`, `featureStatus`, `scanner`.
- **Expected result:** All three phrases present. Any missing phrase is a content-depth failure.
- **Edge case:** The phrase "per-artefact" may be written as "per artefact" (no hyphen). The regex uses `/per[-\s]artefact/i`. `featureStatus` is a code token and must appear verbatim (case-sensitive backtick-wrapped). `scanner` is a conceptual name and uses case-insensitive substring.

---

## Integration Tests

None. Documentation story — no component seams to exercise.

---

## NFR Tests

The story states: "None identified — documentation only."

No NFR tests written — confirmed against the story's NFR block.

---

## Out of Scope for This Test Plan

- **Prose quality / readability / tone of CONTRIBUTING.md.** Not testable by machine. Reviewer-checked at `/review` (already complete: review-1 + review-2 both PASS).
- **Consistency with external references.** CONTRIBUTING.md must not contradict `006-engine-consolidation-proposal.md` — that consistency is reviewer-checked, not asserted here.
- **Link integrity inside CONTRIBUTING.md.** A markdown-link-check CI step would catch broken links, but is not required by any AC; deferred to a follow-up.
- **CODEOWNERS activation.** Explicitly out-of-scope per story.

---

## Test Gaps and Risks

| Gap | Reason | Mitigation |
|-----|--------|------------|
| AC1a sequencing is reviewer-gated, not test-gated. | The gate depends on cross-story state at merge time. | Scenario 2 prompts the reviewer; PR description must call out ec3.1 status. If ec3.1 is not in-flight, subsection 7 is held back per the AC. |
| AC2 commit-message convention is not enforced by the test plan. | Commit messages are not artefact content. | Scenario 3 prompts the reviewer at PR. A commit-msg lint hook is a separate improvement story if it becomes a recurring gap. |
| AC1 keyword test accepts ≥ 5 of 11 scope tokens (loose enumeration). | The AC does not dictate exact wording; enforcing all 11 would reject valid phrasings. | Accepted — the ≥ 5 threshold catches a stub subsection but permits stylistic variation. If a reviewer finds an enumeration is incomplete despite passing the 5-token floor, they raise it at `/review`. |
