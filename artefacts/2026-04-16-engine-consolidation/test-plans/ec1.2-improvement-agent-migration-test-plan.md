## Test Plan: Migrate src/improvement-agent/ → cli/src/agents/improvement-agent/

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec1.2-improvement-agent-migration.md`
**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-1-subcomponent-migrations.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec1.2-improvement-agent-migration-review-1.md` — PASS, 0 HIGH / 0 MEDIUM / 3 LOW.
**Test plan author:** Copilot (Claude Opus 4.6), derived from ec1.1 pattern-setter.
**Date:** 2026-04-17

---

## AC Coverage

Migration ACs verify a structural move, not runtime behaviour. Unit coverage is by node assertion script; integration coverage is the existing `check-improvement-agent.js`, `check-challenger.js`, `failure-detector.test.js`, `failure-detector.integration.test.js` tests running against the moved code; AC6 (PR evidence) is verified manually since it's a git-platform artefact, not runnable code.

| AC  | Description                                                                                                      | Unit    | Integration | E2E | Manual                | Gap type | Risk |
|-----|------------------------------------------------------------------------------------------------------------------|---------|-------------|-----|-----------------------|----------|------|
| AC1 | Pre-migration test-count + pass-rate snapshot captured and recorded in DoD artefact.                             | —       | —           | —   | Scenario 1            | Operator-captured baseline — no pre-code test possible | 🟢 |
| AC2 | `src/improvement-agent/` contains 0 `.js` / `.ts` files after `git mv`.                                            | 1       | —           | —   | —                     | —        | 🟢 |
| AC3 | Test files moved to `cli/tests/agents/improvement-agent/`; imports rewritten.               | 2       | —           | —   | —                     | —        | 🟢 |
| AC4 | No executable code or imports reference the old path `src/improvement-agent`.                        | 1       | —           | —   | —                     | —        | 🟢 |
| AC5 | Post-migration test count + pass rate exactly matches the AC1 snapshot — any drift blocks the PR.                | —       | 1           | —   | —                     | —        | 🟢 |
| AC6 | PR description contains both pre- and post-migration snapshots side by side.                                     | —       | —           | —   | Scenario 6            | Lives in PR metadata, not repo files — reviewer-checked | 🟢 |

**Totals:** 4 unit checks, 1 integration check, 1 NFR test (audit / git log --follow), 2 manual scenarios. Performance / Security / Accessibility NFRs carry "None — confirmed, move-only" per the story's NFR block.

---

## Coverage gaps

| Gap | AC | Gap type | Reason untestable automatically | Handling |
|-----|----|----------|----------------------------------|----------|
| Pre-migration snapshot is an operator-captured number recorded in the DoD artefact. | AC1 | Operator-captured baseline | Snapshot exists only if a human runs the test once before `git mv` and transcribes results. No pre-code automated test can observe a pre-migration state. | Manual scenario 1 in verification script. AC5 comparison is automated against the transcribed number. |
| PR description diff check is a GitHub artefact, not a repo file. | AC6 | External-dependency (GitHub PR API) | The assertion is about text on a PR page, not code. A CI lint that reads PR body via the GitHub API would be possible but is out of scope. | Manual scenario 6 in verification script. Reviewer checks PR body at review time. |

---

## Test Data Strategy

**Source:** Synthetic — no runtime data involved. "Data" here is the repository file tree itself (file paths, file contents, grep output, test count from running the existing tests).
**PCI/sensitivity in scope:** No.
**Availability:** Available now — all data is the current repo state.
**Owner:** Self-contained.

### Data requirements per AC

| AC  | Data needed                                                                                 | Source                                       | Sensitive fields | Notes |
|-----|---------------------------------------------------------------------------------------------|----------------------------------------------|------------------|-------|
| AC1 | Test count, pass rate, exact test names from running `tests/check-improvement-agent.js`, `tests/check-challenger.js`, `tests/failure-detector.test.js`, `tests/failure-detector.integration.test.js` at HEAD.    | Output of `node tests/check-improvement-agent.js` (and equivalent for other test files) before `git mv`. | None             | Transcribed into DoD artefact. |
| AC2 | File listing of `src/improvement-agent/`.                                                           | `git ls-files src/improvement-agent/ \| grep -E '\.(js\|ts)$'` post-move. | None             | Expected empty. |
| AC3 | File listing of `cli/src/agents/improvement-agent/` and `cli/tests/agents/improvement-agent/`.                                | `git ls-files` post-move.                  | None             | Expected to contain the moved files. |
| AC4 | Repo-wide grep for `src/improvement-agent`.                                     | `grep -rn "src/improvement-agent" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=artefacts`. | None             | Expected: matches only in docs / decisions.md / discovery.md, not executable code. |
| AC5 | Test count, pass rate from running `cli/tests/agents/improvement-agent/check-improvement-agent.js`, `cli/tests/agents/improvement-agent/check-challenger.js`, `cli/tests/agents/improvement-agent/failure-detector.test.js`, `cli/tests/agents/improvement-agent/failure-detector.integration.test.js` at new path.                  | Output of the moved tests post-move. | None             | Compared against AC1 snapshot. |
| AC6 | Text content of the PR description.                                                         | GitHub PR body.                              | None             | Reviewer-checked. |

### PCI / sensitivity constraints

None.

### Gaps

None.

---

## Unit Tests

Unit tests are implemented as a single node check script: `cli/tests/agents/improvement-agent/migration-invariants.test.ts` (or equivalent vitest file — exact filename decided at implementation). Each assertion block below is one failing test.

### Test: `src/improvement-agent/` is empty of executable code post-migration

- **Verifies:** AC2
- **Precondition:** `git mv` has completed for `src/improvement-agent/**` → `cli/src/agents/improvement-agent/**`.
- **Action:** `fs.readdirSync('src/improvement-agent', { recursive: true })` filtered to `.js` / `.ts` files.
- **Expected result:** Array length is exactly 0. Asserts: `expect(files).toHaveLength(0)`. Optional: `expect(fs.existsSync('src/improvement-agent')).toBe(false)` if the directory itself is deleted.
- **Edge case:** No. (The directory either exists and is empty, or is deleted. Both satisfy AC2.)

### Test: moved source files are present at the new CLI path

- **Verifies:** AC3 (half — source files)
- **Precondition:** `git mv` has completed.
- **Action:** For each expected file (`failure-detector.js`, `challenger.js`, `trace-interface.js`), assert `fs.existsSync('cli/src/agents/improvement-agent/' + relativePath) === true`.
- **Expected result:** Every expected file is present.
- **Edge case:** No.

### Test: moved test files are present at the new CLI test path and imports are rewritten

- **Verifies:** AC3 (half — test files + import rewrite)
- **Precondition:** `git mv` has completed.
- **Action:** (a) assert `fs.existsSync(`cli/tests/agents/improvement-agent/check-improvement-agent.js`) === true` and `fs.existsSync(`cli/tests/agents/improvement-agent/check-challenger.js`) === true` and `fs.existsSync(`cli/tests/agents/improvement-agent/failure-detector.test.js`) === true` and `fs.existsSync(`cli/tests/agents/improvement-agent/failure-detector.integration.test.js`) === true`; (b) read each file and assert **no line** matches the regex `/\brequire\(['"][^'"]*src/improvement-agent/` or `/\bimport[^;]*from\s+['"][^'"]*src/improvement-agent/`.
- **Expected result:** Files present at new path; no imports reference the old `src/improvement-agent` path.
- **Edge case:** No.

### Test: no executable code imports `src/improvement-agent`

- **Verifies:** AC4
- **Precondition:** `git mv` + import-rewrite has completed.
- **Action:** Repo-wide regex scan for `require\(['"][^'"]*src/improvement-agent/` and `import[^;]*from\s+['"][^'"]*src/improvement-agent/` across all `.js`, `.ts`, `.mjs`, `.cjs` files, excluding `node_modules`, `.git`, and `artefacts/`.
- **Expected result:** Array of matches is empty. Documentation-narrative references in `README.md`, `CHANGELOG.md`, `docs/`, `.github/instructions/`, and `artefacts/` are permitted and excluded from the scan.
- **Edge case:** A dynamic `require(variableName)` that happens to contain the old path cannot be caught by static regex. Accepted as below the radar for a move-only refactor — flag only in retrospective if a runtime breakage occurs.

---

## Integration Tests

### Test: `check-improvement-agent.js`, `check-challenger.js`, `failure-detector.test.js`, `failure-detector.integration.test.js` pass count at new path matches pre-migration snapshot

- **Verifies:** AC5
- **Components involved:** the moved test files (`cli/tests/agents/improvement-agent/check-improvement-agent.js`, `cli/tests/agents/improvement-agent/check-challenger.js`, `cli/tests/agents/improvement-agent/failure-detector.test.js`, `cli/tests/agents/improvement-agent/failure-detector.integration.test.js`) + the moved source at `cli/src/agents/improvement-agent/**`.
- **Precondition:** All file moves complete; import rewrites applied; AC1 pre-migration snapshot recorded in the story's DoD artefact (test names, count, pass rate).
- **Action:** Run each moved test file (`cli/tests/agents/improvement-agent/check-improvement-agent.js`, `cli/tests/agents/improvement-agent/check-challenger.js`, `cli/tests/agents/improvement-agent/failure-detector.test.js`, `cli/tests/agents/improvement-agent/failure-detector.integration.test.js`) from the new path, or `npx vitest run cli/tests/agents/improvement-agent/` to cover them in one pass. Capture test count, pass rate, and test names.
- **Expected result:** Test count exactly matches AC1 snapshot. Pass rate exactly matches AC1 snapshot. Test name set is exactly equal (set-equality — order may differ if the runner is non-deterministic). Any drift (added, dropped, renamed, or newly-failing test) is a **test failure that blocks the PR** per `/decisions` Q2.
- **Edge case:** A pre-existing failure in AC1 that also fails post-migration does **not** block: the invariant is "exactly match," not "all green." Drift is the blocker, not baseline state.

---

## NFR Tests

The story's NFRs are:

- **Performance:** "Test execution time should not materially change." — Treated as advisory; no quantitative threshold specified. Not tested as a blocking NFR.
- **Security:** "No new credential handling, no new external calls, no new file writes outside `cli/`. Move-only." — Implicitly verified by the grep check (AC4) and the pre/post test invariant (AC5): a move-only refactor that doesn't add imports or introduce new file I/O cannot introduce security-relevant behaviour.
- **Accessibility:** N/A.
- **Audit:** "`git log --follow` on moved files should still show the original history." — Verified by one manual check.

### Test: `git log --follow` shows pre-migration history on a moved file

- **NFR addressed:** Audit
- **Measurement method:** Run `git log --follow cli/src/agents/improvement-agent/failure-detector.js`. Assert the log contains at least one commit from **before** the migration commit (SHA precedes the migration SHA).
- **Pass threshold:** At least one pre-migration commit appears in the `--follow` history.
- **Tool:** Shell assertion within the migration-invariants test file, using `child_process.execSync('git log --follow --pretty=%H cli/src/agents/improvement-agent/failure-detector.js')`.

**Performance/Security/Accessibility:** None — confirmed against the story's NFR block.

---

## Out of Scope for This Test Plan

- **Runtime behaviour tests for improvement-agent logic.** The existing test files (`check-improvement-agent.js`, `check-challenger.js`, `failure-detector.test.js`, `failure-detector.integration.test.js`) already cover that; AC5 verifies they still run at the new path without drift.
- **Tests for whether `git mv` (as opposed to `rm` + `add`) was used.** The audit NFR test (git log --follow) catches the consequence; whether the operator *typed* `git mv` is not tested.
- **CI wiring.** The migrated test must still be invoked by `npm test` — but tracking that the package.json script chain was updated is not a separate AC; a broken chain manifests as AC5 failing.
- **Cross-story pattern consistency.** This is a derivative of the ec1.1 pattern; any divergence from the template is noted in the complexity note, not re-tested.

---

## Test Gaps and Risks

| Gap | Reason | Mitigation |
|-----|--------|------------|
| AC1 pre-migration snapshot is operator-captured and transcribed — no automated pre-code test can observe it. | A pre-migration state exists only *before* the first move commit. | Scenario 1 in verification script walks operator through capture + transcription. AC5's automated test reads the transcribed number from the DoD artefact. |
| AC6 PR description content is GitHub metadata, not a repo file. | Assertion is on the PR body, not on any committed artefact. | Scenario 6 in verification script — reviewer checks PR body at `/review` time before `/definition-of-done`. |
| Dynamic `require(variableName)` calls with computed old-path strings are invisible to static grep. | Regex can only match literal strings, not values computed at runtime. | Accepted — this codebase does not use dynamic requires for skill internals (controlled by MC-CLI-01). |
