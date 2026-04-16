# AC Verification Script: Relocate pipeline-state from `.github/` root to per-artefact; root becomes derived

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md`
**Technical test plan:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec3.1-pipeline-state-isolation-test-plan.md`
**Script version:** 1
**Verified by:** _________ | **Date:** _________ | **Context:** [ ] Pre-code  [ ] Post-merge  [ ] Demo

---

## Setup

**Before you start:**
1. Open a terminal at the repo root (the folder containing `package.json`, `.github/`, `cli/`).
2. Confirm you are on the ec3.1 branch (or `develop` post-merge). Run: `git branch --show-current`. Record: _________
3. Have these files open in your editor:
   - `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md` (the ACs reference)
   - `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md` (the implementation plan containing the AC0 audit table) — if the plan doesn't exist yet, you cannot run Scenario 0.
   - `.github/pipeline-state.schema.json`
4. Confirm node is installed and `jq` is available (used in Scenario 7). Run: `node --version && jq --version`. Record: _________

**Reset between scenarios:** Scenarios 1–7 read repo state; no reset needed between them. Scenario 6 runs a real skill and *changes* pipeline-state files — run it last, and reset (`git stash` or `git checkout -- .`) if you want the branch pristine afterwards.

---

## Scenarios

---

### Scenario 0: AC0 slug-detection audit table is present and complete

**Covers:** AC0

**Steps:**
1. Open `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md`.
2. Find the audit table (should be a markdown table titled something like "Slug-detection audit" or "AC0 audit").
3. For the audit to pass, the table must have:
   - A row per pipeline-state-writing skill or helper. To know which skills write state: `grep -rln "pipelineState\|pipeline-state" .github/skills/` lists every candidate. Cross-check the table against this output — every skill that writes state must have a row.
   - A column for the slug-derivation mechanism, populated with one of: `already-present` / `added-in-ec3.1` / `n/a-read-only`. No `unknown`, no blank.
4. Run: `grep -rln "pipelineState\|pipeline-state" .github/skills/ | wc -l`. Compare to the row count in the audit table. They should match (or the audit must explain any row present in one and absent in the other).
5. For any row marked `added-in-ec3.1`, confirm the patch landed in this branch's diff by running: `git log --oneline feature/engine-consolidation-outer-loop -- .github/skills/<skill>/SKILL.md` for each such skill.

**Expected outcome:**
> The audit table has one row per state-writing skill, each with a non-blank slug-derivation mechanism. Every `added-in-ec3.1` row has a corresponding commit in the branch history.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 1: Write targets shifted — no skill writes to `.github/pipeline-state.json`

**Covers:** AC1

**Steps:**
1. Run, exactly as written:

   ```
   grep -rn '\.github/pipeline-state\.json' .github/skills/ scripts/ cli/src/ cli/tests/
   ```
2. Read every line. For each match, decide if it is a **write path** (e.g. `fs.writeFileSync(...)`, `fs.promises.writeFile(...)`, shell `>` redirects) or a **read-only / archival reference** (e.g. scanner input, comment, archival reference).
3. A write-path match is an AC1 failure. Stop and fix.
4. A read-only match must have a comment on the same line or the line above stating `read-only`, `scanner`, `archival`, `aggregate`, or `derived`. If a read-only match has no comment, it is still an AC1 failure — the residual-match annotation rule applies.

**Expected outcome:**
> Zero write-path matches. Every read-only match is explicitly annotated.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 2: Scanner produces a derived aggregate that union-equals the inputs

**Covers:** AC2

**Steps:**
1. Find the scanner script — likely `scripts/build-pipeline-state.js` (name may vary). Run: `ls scripts/ | grep -E "pipeline|aggregate|build-state"`. Record the path: _________
2. Run the scanner at the repo root. Example: `node scripts/build-pipeline-state.js` (adjust invocation to match the implementation).
3. Confirm an output file now exists at `.github/pipeline-state.derived.json`. Run: `ls -la .github/pipeline-state.derived.json`. Record size and mtime.
4. Run: `jq '.features | length' .github/pipeline-state.derived.json`. Compare to `jq '.features | length' tests/fixtures/pipeline-state-legacy.json` (if fixture exists). The counts should be equal or larger on the derived file (derived may include features added post-cut-over).
5. Pick one feature slug you know exists in both (e.g. `2026-04-16-engine-consolidation`). Run: `jq '.features[] | select(.slug=="2026-04-16-engine-consolidation")' .github/pipeline-state.derived.json` and compare its content field-for-field to the same feature in the legacy fixture.

**Expected outcome:**
> Scanner output exists; `features[]` count is ≥ legacy count; cross-feature content matches field-for-field for features present in both.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 3: Viz renders from the derived file

**Covers:** AC3

**Steps:**
1. Open `.github/pipeline-viz.html` (or wherever the viz file lives) in your editor. Find the input-path constant — typically a line like `const INPUT_PATH = '.github/pipeline-state.json';` or a fetch URL.
2. Confirm the constant now points at the derived file (`.github/pipeline-state.derived.json` or the agreed derived path). The diff from pre-migration must be exactly one line — no other rendering-logic change.
3. Serve the viz locally. Example: `python3 -m http.server 8080 --directory .github` (adjust per your serving convention). Open the viz URL in your browser.
4. Confirm the page renders: feature cards appear, each with phase progress, story counts. Spot-check that the `2026-04-16-engine-consolidation` card is present and its stage field matches what the derived JSON says.
5. Compare visually to a screenshot of the viz on `develop` pre-migration (if available). The renders should be indistinguishable modulo data that legitimately changed.

**Expected outcome:**
> Viz renders identically to the pre-migration version using the derived file as input. Only change in the HTML is the input-path constant.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 4: DoD write marks `featureStatus: complete` and retains the file

**Covers:** AC4

**Steps:**
1. Identify a test feature that has just reached DoD sign-off (or, pre-code, mentally walk through what the DoD skill write should produce).
2. Run: `cat artefacts/<test-feature-slug>/pipeline-state.json | jq '.featureStatus'`. Expected output: `"complete"`.
3. Run: `git ls-files artefacts/<test-feature-slug>/pipeline-state.json`. Expected output: the path itself (one line). If empty, the file was deleted — that is an AC4 failure.
4. Run: `git log --oneline -- artefacts/<test-feature-slug>/pipeline-state.json | head -3`. The most recent commit should be the DoD write; older commits should show the file's history through the feature's phases.

**Expected outcome:**
> `featureStatus` is `"complete"`. File is tracked by git. Git history shows the file being updated through phases, not created-then-deleted.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 5: Root file disposition — exactly one of two outcomes

**Covers:** AC5

**Steps:**
1. Run: `git ls-files .github/pipeline-state.json`. Observe the output.
2. **If the output is empty** (file deleted): run `git log -- .github/pipeline-state.json | head -5`. The most recent entry should be the relocation commit with a message like `chore: relocate pipeline-state to per-artefact` or similar. Confirm this. If the git log is empty too, the file was never tracked — something else is wrong.
3. **If the output shows `.github/pipeline-state.json`** (file retained as pointer): run `wc -l .github/pipeline-state.json`. The count must be ≤ 10. Open the file. Confirm it contains the phrases `per-artefact` (or `per artefact`) and a reference to the derived path (`.github/pipeline-state.derived.json` or similar). Confirm the file does NOT contain a `features` array or pipeline data — it is a pointer document, not a state file.
4. Confirm **exactly one** of the two outcomes. If neither and both, AC5 fails.

**Expected outcome:**
> Exactly one of: (a) file absent with relocation commit in git log; (b) file present as a ≤10-line pointer document with the required references.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 6: End-to-end phase-boundary round-trip via a real skill

**Covers:** AC6

**Steps:**
1. Pick an in-flight feature you are willing to exercise — e.g. the engine-consolidation feature itself, or a throwaway test feature you create.
2. Note the current content (or mtime) of `artefacts/<slug>/pipeline-state.json` and of `.github/pipeline-state.json` (if present as pointer). Run: `stat artefacts/<slug>/pipeline-state.json .github/pipeline-state.json 2>/dev/null`.
3. Invoke a skill that does a state-write — e.g. `/workflow` (which writes a reconciliation) or a lightweight phase-boundary skill. Let it complete.
4. Run: `git diff --name-only` to see which files changed. Expected: `artefacts/<slug>/pipeline-state.json` in the list; `.github/pipeline-state.json` **not** in the list.
5. Run: `git diff artefacts/<slug>/pipeline-state.json | head -30` to see what changed inside the per-artefact file. Expected: `updatedAt` bumped, one or more phase-specific fields changed.

**Expected outcome:**
> Only the per-artefact file changes; the root file (if present) is untouched. The change inside the per-artefact file is the expected state-write for the skill that ran.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 7: Schema delta is one additive change

**Covers:** AC7

**Steps:**
1. Run: `git diff --unified=0 <merge-base>..HEAD -- .github/pipeline-state.schema.json`. Use `git merge-base develop HEAD` to find the merge base if you don't know it. Replace `<merge-base>` with the commit SHA.
2. Read the diff. Every removed line (a `-` line) should be matched by a re-added line identical except for whitespace — the only substantive delta should be the addition of a `featureStatus` property with enum `["in-flight", "complete"]`.
3. Alternatively, run:

   ```
   diff <(git show <merge-base>:.github/pipeline-state.schema.json | jq -S .) <(jq -S . .github/pipeline-state.schema.json)
   ```

   This normalises both schemas (sorted keys) and shows the structural diff. The diff should contain one additive block — the `featureStatus` field — and nothing else.
4. Confirm no existing property was removed, renamed, or retyped.

**Expected outcome:**
> Schema diff is exactly one additive change: `featureStatus` as a top-level enum on the feature record. No other structural changes.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

## Summary

| Scenario                                                         | Result | Notes |
|------------------------------------------------------------------|--------|-------|
| Scenario 0 — AC0 audit table present and complete                |        |       |
| Scenario 1 — Write targets shifted away from root                |        |       |
| Scenario 2 — Scanner aggregate union-equals inputs               |        |       |
| Scenario 3 — Viz renders from derived file                       |        |       |
| Scenario 4 — DoD write marks complete + retains file             |        |       |
| Scenario 5 — Root file disposition                               |        |       |
| Scenario 6 — End-to-end phase-boundary round-trip                |        |       |
| Scenario 7 — Schema delta is one additive change                 |        |       |

**Overall verdict:** [ ] All pass — ready to proceed
[ ] Failures found — log findings below before proceeding

---

## Findings

| Scenario | Expected | Actual | Severity | Action |
|----------|----------|--------|----------|--------|
|          |          |        | HIGH / MED / LOW | Fix AC / Fix implementation / Accept |
