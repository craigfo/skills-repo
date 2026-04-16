## Test Plan: Relocate pipeline-state from `.github/` root to per-artefact; root becomes derived

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md`
**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-3-pipeline-state-isolation.md`
**Decisions reference:** Q5 (ARCH scope-add, 2026-04-16) and review-1 M1 resolution (2026-04-17 — AC0 added).
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec3.1-pipeline-state-isolation-review-1.md` — PASS WITH CONDITIONS, 0 HIGH / 1 MEDIUM (resolved) / 5 LOW. MEDIUM M1 resolved 2026-04-17 via AC0.
**Test plan author:** Copilot (Claude Opus 4.6).
**Date:** 2026-04-17

---

## AC Coverage

Structural refactor story — pipeline-state write surface reshapes from one root file to N per-artefact files, with a derived aggregate. 8 ACs (AC0–AC7) cover audit, write-target shift, scanner, viz input, DoD marker, root-file disposition, end-to-end phase write, and schema delta.

| AC  | Description                                                                                                              | Unit | Integration | E2E | Manual     | Gap type | Risk |
|-----|--------------------------------------------------------------------------------------------------------------------------|------|-------------|-----|------------|----------|------|
| AC0 | Slug-detection audit: every pipeline-state writer derives the active feature-slug from context (or is patched to).       | 1    | —           | —   | Scenario 0 | Audit-table review (operator-captured) | 🟡 |
| AC1 | Every skill / helper writes to `artefacts/<current-feature-slug>/pipeline-state.json`, not `.github/pipeline-state.json`. | 2    | —           | —   | —          | —        | 🟢 |
| AC2 | Scanner script produces a derived aggregate whose `features[]` union-equals the per-artefact inputs.                     | 1    | 1           | —   | —          | —        | 🟢 |
| AC3 | `pipeline-viz.html` renders from the derived file with only an input-path change (no rendering-logic change).            | —    | 1           | —   | Scenario 3 | Viz renders in a real browser — spot-check manual | 🟡 |
| AC4 | On DoD sign-off, artefact's `pipeline-state.json` gets `featureStatus: complete` and the file is retained (not deleted). | 1    | 1           | —   | —          | —        | 🟢 |
| AC5 | `.github/pipeline-state.json` is either deleted (history via relocation commit) OR replaced with a ≤10-line pointer doc. | 1    | —           | —   | —          | —        | 🟢 |
| AC6 | A full skill invocation writes to the per-artefact file and not the root file (round-trip observable via `git diff`).    | —    | 1           | —   | Scenario 6 | Requires running a real skill — integration harness | 🟡 |
| AC7 | `pipeline-state.schema.json` diff is exactly one additive change: `featureStatus` enum field.                            | 1    | —           | —   | —          | —        | 🟢 |

**Totals:** 7 unit checks, 4 integration checks, 2 NFR tests (scanner runtime, backward readability), 3 manual scenarios. Three ACs (AC0 audit-table, AC3 viz render, AC6 end-to-end round-trip) carry 🟡 risk because they blend automation with reviewer or browser judgement.

**NFRs:**
- **Scanner runtime** NFR is tested as a perf NFR with a <1s pass threshold.
- **Backward readability** NFR is implicitly covered by AC2's union-equality check plus AC7's schema-delta check; no separate NFR test needed beyond a one-line confirmation.

---

## Coverage gaps

| Gap | AC | Gap type | Reason untestable automatically | Handling |
|-----|----|----------|----------------------------------|----------|
| AC0 slug-detection audit is an operator-captured table, not runtime behaviour. | AC0 | Audit-table (operator-captured) | The audit *is* the artefact the AC demands; a test can only check that the table exists and has the required columns per writer. | Unit test asserts the audit table is present in the implementation plan with one row per pipeline-state-writing skill. Scenario 0 walks operator through capture. |
| AC3 viz-rendering equivalence. | AC3 | Browser-rendering (not CSS-layout-dependent, but requires a rendered page) | The render happens in a browser's JSON-to-DOM path; diffing DOM trees pre/post path change is non-trivial in a test harness. | Integration test compares the scanner output against the pre-relocation root file; a passing union-equality test + a one-line path-constant change make the render change safe by construction. Scenario 3 asks a human to load the viz in a real browser and spot-check. |
| AC6 end-to-end round-trip requires actually running a skill and observing a pipeline-state write. | AC6 | Integration-harness | A single skill invocation writing state is a multi-step behaviour; an isolated test can stub it but won't catch real-skill bugs. | Integration test runs one lightweight skill (`/workflow` or a stub skill) in a test repo with ≥1 artefact folder and asserts the expected per-artefact file is touched and the root file is not. Scenario 6 asks the operator to repeat with a real in-flight skill run. |

---

## Test Data Strategy

**Source:** Mixed.
- **Synthetic** — test fixtures for the scanner: minimal `artefacts/test-A/pipeline-state.json` and `artefacts/test-B/pipeline-state.json` created in test setup under a temporary directory, never committed.
- **Fixtures** — committed test artefact (`tests/fixtures/pipeline-state-legacy.json`) representing the pre-migration root file for AC2 union-equality comparison. Content: anonymised snapshot of the current `.github/pipeline-state.json` at the point ec3.1 implementation begins.
- **Live** — the repo's own `.github/pipeline-state.json` (at the time the test runs) for the AC2 "side-by-side with pre-existing root" verification.

**PCI/sensitivity in scope:** No.
**Availability:** Available now — legacy fixture captured from current `.github/pipeline-state.json`; synthetic fixtures generated in test setup.
**Owner:** Self-contained.

### Data requirements per AC

| AC  | Data needed                                                                                                                 | Source                                                          | Sensitive fields | Notes |
|-----|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------|-------|
| AC0 | Audit table in ec3.1 implementation plan listing every pipeline-state-writing skill.                                        | `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md` (or equivalent). | None             | Operator-captured. |
| AC1 | Repo-wide grep output for `.github/pipeline-state.json` in `.github/skills/`, `scripts/`, `cli/`.                            | Live repo.                                                      | None             | Zero non-read-only matches. |
| AC2 | Pre-migration root file + N per-artefact files.                                                                             | `tests/fixtures/pipeline-state-legacy.json` (snapshot) + test-setup synthetic files. | None             | Used for union-equality diff. |
| AC3 | Scanner output at the expected derived path.                                                                                | `.github/pipeline-state.derived.json` (post-scan).             | None             | One-line path constant change in viz HTML. |
| AC4 | A test feature artefact reaching DoD state with the DoD skill having run.                                                   | Integration harness with a stub DoD invocation on a test feature. | None             | Asserts `featureStatus: complete` + file retained. |
| AC5 | State of `.github/pipeline-state.json` post-migration.                                                                      | Live repo at HEAD.                                              | None             | Either absent (AC5 delete variant) or a ≤10-line pointer file (AC5 pointer variant). |
| AC6 | Before/after `git diff` across a stub skill invocation.                                                                     | Integration harness with a stub skill writing state.            | None             | Assertions on touched paths. |
| AC7 | `pipeline-state.schema.json` before + after.                                                                                | Git show `HEAD~1:.github/pipeline-state.schema.json` vs HEAD.  | None             | `jq diff` or structural compare. |

### PCI / sensitivity constraints

None.

### Gaps

None beyond those flagged in the coverage-gaps section.

---

## Unit Tests

Unit tests are implemented in a single vitest file under `cli/tests/engine/pipeline-state/migration.test.ts` (or equivalent — final placement decided at implementation).

### Test: AC0 audit table exists in implementation plan

- **Verifies:** AC0
- **Precondition:** `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md` (or the implementation plan path) has been written.
- **Action:** Read the plan file. Assert it contains a markdown table with headings matching `/skill|helper/i` and `/slug.*deriv/i` and a third column matching `/mechanism|status|source/i`. Extract rows; assert at least 6 rows (the current count of pipeline-state-writing SKILL.md files — `discovery`, `benefit-metric`, `definition`, `review`, `test-plan`, `definition-of-ready`, `definition-of-done`, `improvement`, `checkpoint`, etc.; final count is whatever the audit surfaces).
- **Expected result:** Table present with ≥1 row per surfaced writer. Every row's status column reads `already-present`, `added-in-ec3.1`, or `n/a-read-only` — no `unknown` or blank.
- **Edge case:** A plan with fewer than 6 rows may indicate an incomplete audit — flag as test failure with a message pointing at the audit-completeness requirement in AC0.

### Test: AC1 zero `.github/pipeline-state.json` write-path matches

- **Verifies:** AC1 (primary)
- **Precondition:** All skill / helper updates complete.
- **Action:** Run `grep -rn '\.github/pipeline-state\.json' .github/skills/ scripts/ cli/src/ cli/tests/` programmatically. Filter out matches that are inside a line annotated with a `read-only` or `archival` comment (e.g. `// read-only — scanner output only`).
- **Expected result:** Empty match set after filtering. Any match that is a write-path (e.g. `fs.writeFileSync('.github/pipeline-state.json', ...)`) is a failure.
- **Edge case:** A match in a `.md` file (documentation) inside `.github/skills/` is permitted — SKILL.md files reference the path in prose. The filter excludes `.md` from the write-path check.

### Test: AC1 legacy matches in excluded paths are explicitly commented

- **Verifies:** AC1 (residual-match annotation)
- **Precondition:** Any residual `.github/pipeline-state.json` references left in the codebase (in scanner or archival paths).
- **Action:** For each match the primary AC1 test excludes (via the comment filter), re-read the line. Assert the comment contains one of: `read-only`, `scanner`, `archival`, `aggregate`, or `derived` (case-insensitive).
- **Expected result:** Every residual match is annotated. A residual match without an annotation is a failure — silently leaving a reference is not permitted by AC1.
- **Edge case:** A match in `.github/pipeline-state.schema.json` is expected (the schema still describes the shape of a pipeline-state file). The filter permits matches in `.json` schema files without a comment requirement.

### Test: AC2 scanner union-equality against legacy fixture

- **Verifies:** AC2 (functional correctness)
- **Precondition:** Scanner script (`scripts/build-pipeline-state.js` or equivalent) is implemented; `tests/fixtures/pipeline-state-legacy.json` is captured.
- **Action:** In a tmpdir, create two fixture `artefacts/test-A/pipeline-state.json` and `artefacts/test-B/pipeline-state.json` whose `features[]` entries, when unioned, exactly reproduce a subset of the legacy root file. Invoke the scanner with `--root=<tmpdir>` (or equivalent). Read the scanner output.
- **Expected result:** Scanner output's `features[]` is ordered by `updatedAt` descending and field-for-field equals the union of test-A and test-B inputs. JSON deep-equal check. If either fixture has a feature with more recent `updatedAt`, it appears first.
- **Edge case:** Empty `artefacts/*/pipeline-state.json` files should be skipped (not produce empty entries in the aggregate). A malformed JSON file must cause the scanner to fail loud — tested separately.

### Test: AC4 featureStatus enum marker present on DoD-complete features

- **Verifies:** AC4
- **Precondition:** Stub DoD invocation has written final state on a test feature.
- **Action:** Read `artefacts/<test-feature-slug>/pipeline-state.json`. Assert `featureStatus` is present at the top level and equals `"complete"`. Separately, run the repo's `jsonschema` validator (or equivalent) against the updated `pipeline-state.schema.json` to confirm the file validates against the updated schema.
- **Expected result:** Field present; value is in `{"in-flight", "complete"}`; file validates. The file is still present on disk after the DoD write (not deleted, not moved).
- **Edge case:** Pre-migration in-flight features have no `featureStatus` field. Backward readability NFR requires the scanner tolerate missing `featureStatus` on legacy entries — assert this separately.

### Test: AC5 root file disposition is exactly one of two outcomes

- **Verifies:** AC5
- **Precondition:** Migration commit has landed.
- **Action:** `git ls-files .github/pipeline-state.json`. If the path is returned:
  - Read the file. Assert line count ≤10, and the content matches a pointer template — specifically contains substrings `per-artefact` and `.github/pipeline-state.derived.json` (or the agreed derived path) and `scanner`.
  If the path is **not** returned:
  - Assert `git log -- .github/pipeline-state.json` shows the relocation commit with a message mentioning `relocat` or `migrat` (case-insensitive).
- **Expected result:** Exactly one of the two outcomes. Both are failures; neither is a failure.
- **Edge case:** A partial pointer doc (e.g. >10 lines, or missing the derived-path reference) is a failure — AC5 is strict on the "pointer document" shape.

### Test: AC7 schema delta is exactly one additive change

- **Verifies:** AC7
- **Precondition:** Schema has been updated.
- **Action:** `git show HEAD~1:.github/pipeline-state.schema.json` vs `git show HEAD:.github/pipeline-state.schema.json`. Parse both; compute structural diff.
- **Expected result:** Diff consists of exactly one change: addition of a top-level enum field `featureStatus` on the feature-record sub-schema with the enum values `["in-flight", "complete"]`. No removed, renamed, or retyped existing fields.
- **Edge case:** If the schema was split across multiple commits during migration, compare the branch's merge-base schema vs HEAD schema, not strictly `HEAD~1`.

---

## Integration Tests

### Test: AC2 scanner round-trip against live repo state

- **Verifies:** AC2 (real-world)
- **Components involved:** Scanner script + real `artefacts/*/pipeline-state.json` files in the repo.
- **Precondition:** At least two real features have per-artefact state files (e.g. 2026-04-16-engine-consolidation and any older feature migrated to per-artefact).
- **Action:** Run the scanner at the repo root. Read its output at the derived path. Compute a union diff against `tests/fixtures/pipeline-state-legacy.json`.
- **Expected result:** Every feature present in the legacy fixture is present in the scanner output with equivalent (field-for-field) content. Features present in per-artefact files but absent from legacy (because they were added post-cut-over) are permitted and appear only in the scanner output.
- **Edge case:** A feature present in legacy but NOT in any per-artefact file would be a migration gap — the test fails with a message naming the missing slug.

### Test: AC3 viz renders from derived file

- **Verifies:** AC3
- **Components involved:** Scanner output + `pipeline-viz.html` + headless browser (or DOM simulation for the structural check).
- **Precondition:** Scanner output exists; `pipeline-viz.html` input-path constant has been changed.
- **Action:** Either (a) spin a local server and fetch the viz page via a headless browser (playwright if configured; otherwise skip), and assert the page DOM contains feature cards for every feature in the scanner output; OR (b) read `pipeline-viz.html` source and assert its input-path constant is exactly the scanner-output path (one-line textual assertion).
- **Expected result:** Path constant changed; viz fetches the derived file. Full rendering is verified by Scenario 3 if playwright is unavailable.
- **Edge case:** The one-line path change is the primary AC3 assertion; rendering equivalence is bonus coverage and may gate only on option (a).

### Test: AC4 DoD round-trip — file retained post-completion

- **Verifies:** AC4 (retention half)
- **Components involved:** Stub DoD skill invocation + per-artefact file.
- **Precondition:** Test feature has a pre-DoD per-artefact file.
- **Action:** Invoke stub DoD. Assert per-artefact file is present (`fs.existsSync`). Assert its content has `featureStatus: complete`. Assert `git ls-files <path>` returns the path (tracked).
- **Expected result:** All three assertions pass.
- **Edge case:** A future DoD skill that deletes or moves the file fails this test — the test is specifically the retention invariant.

### Test: AC6 end-to-end phase-boundary round-trip

- **Verifies:** AC6
- **Components involved:** A stub skill invocation that writes pipeline state + both the per-artefact and root files.
- **Precondition:** Test feature has a per-artefact state file; root file is either absent or a pointer doc.
- **Action:** `git diff` the repo before and after stub skill invocation. Assert the diff touches exactly `artefacts/<test-slug>/pipeline-state.json` (not `.github/pipeline-state.json`).
- **Expected result:** Root file is unchanged across the invocation; per-artefact file's `updatedAt` and phase-specific fields are changed.
- **Edge case:** If the skill writes to both files (transition-period behaviour), the test fails — the transition ends with ec3.1 landing, not before.

---

## NFR Tests

### Test: Scanner runtime <1 second on ≤10 features

- **NFR addressed:** Scanner runtime
- **Measurement method:** Generate 10 synthetic `artefacts/test-*/pipeline-state.json` fixtures in a tmpdir. Time the scanner invocation using `performance.now()` around the call.
- **Pass threshold:** <1000 ms on a dev laptop. Record actual runtime in test output for future comparison.
- **Tool:** vitest + `performance.now()`.

### Test: Backward readability — legacy features survive the scanner

- **NFR addressed:** Backward readability
- **Measurement method:** Craft a per-artefact fixture that represents a pre-migration feature (no `featureStatus` field — only the fields that existed in the old root schema). Feed it to the scanner. Assert the scanner output includes the feature and no field is dropped.
- **Pass threshold:** 100% field retention from input to output; no errors raised about missing `featureStatus`.
- **Tool:** vitest.

---

## Out of Scope for This Test Plan

- **Migration of historical completed features into per-artefact files.** Story-scope excluded.
- **Write-locking / advisory file-lock mechanisms.** Per-artefact sharding is the structural answer; no locking needed.
- **`pipeline-viz.html` rendering-logic changes.** Out of scope per story (AC3 is input-path only).
- **New metrics beyond MM4.** Scope excluded.
- **Net-new slug-detection infrastructure** — out of scope per story's revised Out-of-Scope section (AC0 covers localised patches).

---

## Test Gaps and Risks

| Gap | Reason | Mitigation |
|-----|--------|------------|
| AC0 audit-completeness is reviewer-judged (is the audit exhaustive?). | A test can check table structure and row-count floor; it cannot know whether every actual writer surfaced. | Scenario 0 walks the operator through writer-discovery (grep + cross-check against SKILL.md writers). |
| AC3 full render equivalence may depend on playwright availability. | If the repo has no headless-browser tooling, the test degrades to a path-constant check. | Scenario 3 covers the rendering check manually. If playwright lands later, promote to automated. |
| AC6 round-trip uses a stub skill — a real skill may have paths not covered by the stub. | A stub is behaviour-bounded; real skills have broader paths (error handling, schema validation). | Scenario 6 asks the operator to run one real in-flight skill and re-observe the diff invariant. |
| MM4(b) operational window (30 days post-ship) is outside this story's DoD. | Per the benefit-metric amendment, (b) needs a 30-day observation. | Noted on the benefit-metric sheet as a follow-up signal; not gated by this test plan. |
