# AC Verification Script: Migrate src/surface-adapter/ → cli/src/adapters/surface-adapter/

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec1.1-surface-adapter-migration.md`
**Technical test plan:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec1.1-surface-adapter-migration-test-plan.md`
**Script version:** 1
**Verified by:** _________ | **Date:** _________ | **Context:** [ ] Pre-code  [ ] Post-merge  [ ] Demo

---

## Setup

**Before you start:**
1. Open a terminal at the repo root (the folder containing `package.json`, `.github/`, `cli/`).
2. Confirm you are on the migration branch for this story — e.g. `feature/ec1.1-surface-adapter-migration` (or the engine-consolidation outer-loop branch if you're doing all 7 migrations on one branch). Run: `git branch --show-current`. Record the branch name here: _________
3. Confirm the branch is **before** any `git mv` has been run for `src/surface-adapter/`. Run: `ls src/surface-adapter/ | head -5`. You should see files (`index.js`, `resolver.js`, an `adapters/` folder). If `src/surface-adapter/` is already empty or missing, you are on a post-migration branch — stop and rewind before running Scenario 1.
4. Confirm node is installed and the repo's test tools work. Run: `node --version`. Record the version: _________

**Reset between scenarios:** Scenarios 1 and 2+ depend on repo state (pre-migration vs post-migration). Do not mix. Run Scenario 1 fully before doing any `git mv`; run Scenarios 2–6 only after all `git mv` operations are complete.

---

## Scenarios

---

### Scenario 1: Capture the pre-migration test snapshot

**Covers:** AC1

**Steps:**
1. At the repo root, run: `node .github/scripts/check-surface-adapter.js`
2. Watch the output carefully. Note the final lines — they will report either a pass/fail summary, or silently exit 0 (which means all checks passed).
3. If the script prints a count line (e.g. `ran N assertions, 0 failures`), copy that number. If it does not print a count, record the observation: "script exits silently — passing". Also record the **exit code** by running: `echo $?` immediately after. An exit code of `0` means pass; anything non-zero is a pre-existing failure (record it — it becomes the baseline).
4. Run: `grep -cE "^(function|const|let|var)\s+(test|check|assert)" .github/scripts/check-surface-adapter.js` — this gives an approximate count of test-like functions in the file. Record it: _________
5. Open `.github/scripts/check-surface-adapter.js` and skim for the assertion style (`console.assert`, `if (...) throw`, `process.exit(1)` patterns). Note the count of such assertion sites. Record: _________
6. Transcribe the three numbers above into the story's DoD artefact (`artefacts/2026-04-16-engine-consolidation/dod/ec1.1-surface-adapter-migration-dod.md` when it is created), in a block titled `### pre-migration-tests`.

**Expected outcome:**
> You have three recorded numbers transcribed into the DoD artefact: (a) exit code of `check-surface-adapter.js`, (b) count of test-like functions, (c) count of assertion sites. These numbers form the baseline that Scenario 5 will compare against.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 2: Source directory is empty after `git mv`

**Covers:** AC2

**Steps:**
1. After all `git mv` operations for Epic 1 story ec1.1 are complete (subfiles `index.js`, `resolver.js`, plus `adapters/{git-native,iac,saas-api,saas-gui,m365-admin,manual}.js`), run: `ls src/surface-adapter/ 2>/dev/null || echo "directory does not exist"`
2. If the directory still exists, run: `find src/surface-adapter/ -type f \( -name "*.js" -o -name "*.ts" \) | wc -l`. The count should be `0`.
3. If the directory is fully deleted, the check passes trivially.

**Expected outcome:**
> Either the directory `src/surface-adapter/` does not exist, or it exists with zero `.js` / `.ts` files inside it. Any remaining `.js` or `.ts` file is a missed move — stop, move it, then re-run this scenario.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 3: Moved files are present at the new CLI path

**Covers:** AC3

**Steps:**
1. Run: `ls cli/src/adapters/surface-adapter/`. You should see `index.js`, `resolver.js`, and a subfolder `adapters/`.
2. Run: `ls cli/src/adapters/surface-adapter/adapters/`. You should see `git-native.js`, `iac.js`, `saas-api.js`, `saas-gui.js`, `m365-admin.js`, `manual.js`.
3. Run: `ls cli/tests/adapters/surface-adapter/`. You should see `check-surface-adapter.js` (the test file that moved with the code).
4. Open `cli/tests/adapters/surface-adapter/check-surface-adapter.js` in your editor. Search for `src/surface-adapter` inside the file (Ctrl+F / Cmd+F). There should be **zero matches** — every import, require, or path string referencing the old source path has been rewritten to the new one (`cli/src/adapters/surface-adapter/...` or a relative path from the test file).

**Expected outcome:**
> Every expected file is present at its new path, and the moved test file contains no leftover references to the old `src/surface-adapter/` location.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 4: No executable code references the old path

**Covers:** AC4

**Steps:**
1. Run this grep, exactly as written:

   ```
   grep -rn "src/surface-adapter" . \
     --exclude-dir=.git \
     --exclude-dir=node_modules \
     --exclude-dir=artefacts
   ```
2. Read every line of output. For each match, decide whether it is **executable code** (a `require`, `import`, shell command, path constant in a `.js`/`.ts`/`.mjs`/`.cjs`/`.sh` file) or **documentation / narrative** (a sentence in `README.md`, `CHANGELOG.md`, `docs/*`, `.github/instructions/*`, `decisions.md`, `discovery.md`).
3. Any match that is **executable code** is an AC4 failure — stop and fix before continuing.
4. Documentation matches are permitted — the narrative references to the migration are allowed.

**Expected outcome:**
> Every `grep` match lives in a documentation or narrative file. Zero matches in executable code.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 5: Post-migration test snapshot matches the pre-migration baseline

**Covers:** AC5

**Steps:**
1. Open the DoD artefact you transcribed into during Scenario 1. Have the three numbers (exit code, test-like function count, assertion site count) visible.
2. Run the moved test script from the new path. The invocation path depends on how the CLI runs its tests — try in order:
   - `node cli/tests/adapters/surface-adapter/check-surface-adapter.js`
   - or, if that fails to resolve imports: `cd cli && node tests/adapters/surface-adapter/check-surface-adapter.js`
   - or, if the migration wires it into vitest: `cd cli && npx vitest run tests/adapters/surface-adapter/`
3. Record the **exit code** (run `echo $?` immediately after). Record the test-like function count (re-run the grep from Scenario 1 step 4 but against the new path: `grep -cE "^(function|const|let|var)\s+(test|check|assert)" cli/tests/adapters/surface-adapter/check-surface-adapter.js`). Record the assertion site count.
4. Compare each number side-by-side with Scenario 1's baseline.

**Expected outcome:**
> Exit code is identical to the pre-migration baseline. Test-like function count is identical. Assertion site count is identical. **Any difference blocks the PR.** A newly-failing test, a renamed test, an added test, a dropped test, or a count drift in either direction means the move was not behaviour-preserving — stop and investigate.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 6: PR description contains both snapshots side by side

**Covers:** AC6

**Steps:**
1. Open the PR on GitHub.
2. Read the PR description (the first message / body, not the commit messages).
3. Confirm the description contains two clearly-labelled blocks — e.g. `### pre-migration-tests` and `### post-migration-tests` — each showing: exit code, test-like function count, assertion site count.
4. Confirm the numbers in the PR description match the numbers recorded in the DoD artefact from Scenarios 1 and 5.

**Expected outcome:**
> The PR body contains both snapshots. The pre-snapshot matches Scenario 1's transcription. The post-snapshot matches Scenario 5's transcription. The two snapshots are presented side by side (or sequentially with clear labels), making the move-only invariant visible to any reviewer without cloning the branch.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Edge case: git log --follow shows pre-migration history on a moved file

**Covers:** NFR — Audit

**Steps:**
1. Run: `git log --follow --oneline cli/src/adapters/surface-adapter/index.js | head -20`
2. Scan the output. You should see commits from **before** the migration commit — i.e. commits that existed when the file was still at `src/surface-adapter/index.js`.

**Expected outcome:**
> `git log --follow` returns commits predating the migration. If the history starts at the migration commit and nothing earlier appears, the move was done as `rm`+`add` rather than `git mv`, and audit history has been lost — block the PR and re-do the move as `git mv`.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

## Summary

| Scenario                                  | Result | Notes |
|-------------------------------------------|--------|-------|
| Scenario 1 — Pre-migration snapshot       |        |       |
| Scenario 2 — Source directory drained     |        |       |
| Scenario 3 — Moved files present          |        |       |
| Scenario 4 — No stale references          |        |       |
| Scenario 5 — Snapshot parity              |        |       |
| Scenario 6 — PR description               |        |       |
| Edge case — git log --follow              |        |       |

**Overall verdict:** [ ] All pass — ready to proceed
[ ] Failures found — log findings below before proceeding

---

## Findings

| Scenario | Expected | Actual | Severity | Action |
|----------|----------|--------|----------|--------|
|          |          |        | HIGH / MED / LOW | Fix AC / Fix implementation / Accept |
