# AC Verification Script: Add CONTRIBUTING.md at repo root

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Technical test plan:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec2.1-contributing-md-test-plan.md`
**Script version:** 1
**Verified by:** _________ | **Date:** _________ | **Context:** [ ] Pre-code  [ ] Post-merge  [ ] Demo

---

## Setup

**Before you start:**
1. Open a terminal at the repo root (the folder containing `package.json`, `.github/`, `cli/`).
2. Confirm you are on the ec2.1 branch (or on `develop` post-merge). Run: `git branch --show-current`. Record: _________
3. Have the story artefact open: `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`. You will reference AC1's enumerated subsection list (topics 1–7).

**Reset between scenarios:** None required — each scenario is read-only.

---

## Scenarios

---

### Scenario 1: All seven required subsections are present in `CONTRIBUTING.md`

**Covers:** AC1

**Steps:**
1. Open `CONTRIBUTING.md` in your editor.
2. Scan the table of contents, or scroll through the headings, and confirm you can find a dedicated subsection for each of the seven topics listed in the story's AC1:
   - (1) Scope ownership — enumerates the five scope rows (standards / Phase 3 artefacts; cli/ + productisation + engine-consolidation; .github/workflows + .github/scripts; product/* + CONTRIBUTING.md + README/QUICKSTART; src/ deprecated)
   - (2) Proposing changes to `product/*` — names the `reference/`-first convention + follow-up-PR sequencing
   - (3) Proposing changes to `standards/*` or `SKILL.md` — references the skills-repo pipeline and the C4 human-approval gate
   - (4) Code changes under scope ownership — owner-proposes-via-PR; cross-review required only for shared files
   - (5) Branching + release — `feature/*` convention; direct-to-master acceptable for solo work; Gate 4 flip-on note
   - (6) In-flight-work signalling — `WIP: <area>` GitHub-issue convention
   - (7) Pipeline-state coordination — per-artefact path; scanner-derived aggregate; `featureStatus: complete` on DoD + file retained
3. Open a second terminal tab and run: `grep -E "^#{2,4}|^\s*[-*]\s+\*\*" CONTRIBUTING.md`. Confirm each of the seven topic keywords (`Scope ownership`, `product/`, `standards/`, `Code changes`, `Branching`, `WIP`, `Pipeline-state`) appears at least once as either a heading (#-prefix) or a bolded bullet label (`- **...**`).
4. Read the body of subsection (1) — confirm it names at least 5 of the following 11 scope tokens: `standards`, `phase 3`, `cli/`, `productisation`, `engine-consolidation`, `.github/workflows`, `.github/scripts`, `product/`, `README`, `QUICKSTART`, `src/`.
5. Read the body of subsection (7) — confirm it contains the phrases `per-artefact` (or `per artefact`), `featureStatus`, and `scanner`.

**Expected outcome:**
> Every one of the seven topics has a dedicated subsection that matches the AC1 description. The scope-ownership subsection enumerates the 5 scope rows; the pipeline-state subsection names the three structural commitments (per-artefact writes, featureStatus marker, scanner-derived aggregate). No subsection is a placeholder or a reference-only link.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 2: Sequencing guard for subsection 7 (pipeline-state coordination)

**Covers:** AC1a

**Steps:**
1. Open this terminal at the repo root and run: `node -e "const s=JSON.parse(require('fs').readFileSync('.github/pipeline-state.json','utf8')); const f=s.features.find(x=>x.slug==='2026-04-16-engine-consolidation'); const e=f.epics.find(e=>e.slug==='epic-3-pipeline-state-isolation'); console.log(JSON.stringify(e?.stories||'epic-3-not-present', null, 2))"`
2. Note what comes back. Interpret it:
   - If the output is `epic-3-not-present` — story `ec3.1` has not yet been registered in pipeline-state. Subsection 7 must **not** be merged in this PR; hold it back to a follow-up per AC1a.
   - If `ec3.1` is registered but its `stage` is still `definition` or `review` — ec3.1 is *in-flight* but has not yet landed behaviour change. Subsection 7 **may** be included if the CONTRIBUTING.md note is framed as "this is the intended model; ec3.1 is mid-flight," but reviewer discretion applies.
   - If `ec3.1` is at `stage: test-plan` or later, or shipped on `develop` — subsection 7 may be included unconditionally.
3. Record the observed `ec3.1` stage: _________
4. Cross-check with git: run `git log --oneline develop --grep="ec3.1" | head -5`. If any commit matches, ec3.1 has landed on `develop`. Record result: _________
5. Make the inclusion/exclusion decision and record it here: [ ] Subsection 7 included  [ ] Subsection 7 held back to follow-up

**Expected outcome:**
> The PR's treatment of subsection 7 matches the state of ec3.1. If ec3.1 is not in-flight or shipped, subsection 7 is absent from this PR. If ec3.1 is in-flight or shipped, subsection 7 is present. The reviewer comment on the PR must explicitly state which path was taken and why.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 3: Commit message lists each file changed with a one-line summary

**Covers:** AC2

**Steps:**
1. Run: `git log -1 --format=%B HEAD` (or `--format=%B` for each commit on the branch if the story was split across commits).
2. Run: `git show --stat HEAD | head -40` (or `git log --stat` for the whole branch).
3. For each file listed under the diff-stat (`CONTRIBUTING.md` and any others), confirm the commit message body contains a line or bullet naming that file with a one-line summary. Example acceptable forms:
   - `- CONTRIBUTING.md: scope ownership + 6 other topic subsections (no subsection 7 pending ec3.1)`
   - `CONTRIBUTING.md — new file, 7 topic subsections matching AC1`
4. A blanket "add governance documents" message without per-file breakdown is **not** acceptable for AC2.

**Expected outcome:**
> Every file changed in the commit has a corresponding one-line summary in the commit message body. If the story was split across multiple commits, every commit satisfies this per its own changes.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

## Summary

| Scenario                                          | Result | Notes |
|---------------------------------------------------|--------|-------|
| Scenario 1 — Seven subsections present with depth |        |       |
| Scenario 2 — AC1a sequencing guard                |        |       |
| Scenario 3 — Commit message per-file summaries    |        |       |

**Overall verdict:** [ ] All pass — ready to proceed
[ ] Failures found — log findings below before proceeding

---

## Findings

| Scenario | Expected | Actual | Severity | Action |
|----------|----------|--------|----------|--------|
|          |          |        | HIGH / MED / LOW | Fix AC / Fix implementation / Accept |
