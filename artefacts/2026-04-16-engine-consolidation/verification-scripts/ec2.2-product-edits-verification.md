# AC Verification Script: Apply `product/*` edits (roadmap + tech-stack + decisions ADR)

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.2-product-edits.md`
**Technical test plan:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec2.2-product-edits-test-plan.md`
**Reference source-of-truth:** `artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md` — section "Proposed `product/*` edits".
**Script version:** 1
**Verified by:** _________ | **Date:** _________ | **Context:** [ ] Pre-code  [ ] Post-merge  [ ] Demo

---

## Setup

**Before you start:**
1. Open a terminal at the repo root.
2. Confirm you are on the ec2.2 branch (or `develop` post-merge). Run: `git branch --show-current`. Record: _________
3. Open these three files side by side in your editor:
   - `product/roadmap.md` (the edited file)
   - `product/tech-stack.md` (the edited file)
   - `product/decisions.md` (the edited file)
4. Have the reference proposal open at the "Proposed `product/*` edits" section: `artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md`.

**Reset between scenarios:** None required — read-only checks.

---

## Scenarios

---

### Scenario 1: All three product/* edits land and match the 006 reference shape

**Covers:** AC1

**Steps:**
1. **Roadmap:** open `product/roadmap.md`. Find a section titled `Productisation thread` (may be at `##` or `#` heading level). Confirm the section body:
   - Names the Phase 1–2 distribution outcome (the "two squads … without forking" phrase, or a close paraphrase).
   - Links to or names `artefacts/2026-04-15-productise-cli-and-sidecar/`.
   - References the engine-consolidation feature either by name or by `artefacts/2026-04-16-engine-consolidation/`.
   Compare side-by-side with 006's roadmap block (lines ~107–120 of the reference file). The landed prose may be reworded — it must *say the same things*, not be identical text.
2. **Tech-stack:** open `product/tech-stack.md`. Find a section titled `Engine layout` (post-consolidation target). Confirm the section contains a tree diagram or bullet tree listing `cli/src/commands/`, `cli/src/engine/`, `cli/src/adapters/`, `cli/src/agents/`, `.github/workflows/`, `.github/scripts/`, and `src/` (marked DEPRECATED). Compare side-by-side with 006's tech-stack block (lines ~122–138).
3. **Decisions ADR:** open `product/decisions.md`. Find an ADR entry titled `ADR-<number>: CLI is the single authoritative control plane`. Confirm it has:
   - `Status: Accepted`
   - A Context section describing the src/ vs cli/ divergence.
   - An Options-considered table with at least three rows (leave-divergent, shared-monorepo, single-CLI).
   - A Decision section naming the single-CLI outcome and "move-only" commitment.
   - A Consequences section.
   Compare side-by-side with 006's ADR block (lines ~140–180).
4. Run the automated keyword check to confirm the minimum-content signal — at the repo root:

   ```
   node -e "
     const fs = require('fs');
     const r = fs.readFileSync('product/roadmap.md', 'utf8');
     const t = fs.readFileSync('product/tech-stack.md', 'utf8');
     const d = fs.readFileSync('product/decisions.md', 'utf8');
     const checks = [
       ['roadmap: Productisation thread heading', /#{1,3}\s+Productisation thread/i.test(r)],
       ['roadmap: references 2026-04-15 productise sidecar artefact', /artefacts\/2026-04-15-productise-cli-and-sidecar/.test(r)],
       ['tech-stack: Engine layout section', /#{1,3}\s+Engine layout/i.test(t)],
       ['tech-stack: cli/src/engine/ path', /cli\/src\/engine\//.test(t)],
       ['tech-stack: src/ DEPRECATED marker', /DEPRECATED/i.test(t)],
       ['decisions: ADR heading with control-plane title', /ADR-\d+:?\s*CLI is the single authoritative control plane/i.test(d)],
       ['decisions: Status Accepted', /Status:?\s*\*{0,2}Accepted/i.test(d)],
       ['decisions: move-only commitment', /move-only/i.test(d)],
     ];
     let pass = 0, fail = 0;
     for (const [name, ok] of checks) { console.log((ok ? 'PASS' : 'FAIL'), '-', name); ok ? pass++ : fail++; }
     console.log('---', pass + ' pass,', fail + ' fail');
     process.exit(fail ? 1 : 0);
   "
   ```

**Expected outcome:**
> All three blocks are present and match the shape of the 006 reference (reviewer judgement on prose fidelity). The automated keyword check reports 8 pass / 0 fail. Any `FAIL` line points directly at the missing content.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

### Scenario 2: Commit message lists each file changed with a one-line summary

**Covers:** AC2

**Steps:**
1. Run: `git log -1 --format=%B HEAD` (or `--format=%B` per commit if the story landed across multiple commits).
2. Run: `git show --stat HEAD | head -30` (or `git log --stat` for the whole branch).
3. For each of the three files (`product/roadmap.md`, `product/tech-stack.md`, `product/decisions.md`), confirm the commit message body contains a line or bullet naming that file with a one-line summary — acceptable forms:
   - `- product/roadmap.md: append Productisation-thread section`
   - `product/tech-stack.md — add Engine layout post-consolidation tree`
   - `product/decisions.md: append ADR-0X (CLI control plane)`
4. A blanket "apply product/* edits" message without per-file breakdown is **not** acceptable for AC2.

**Expected outcome:**
> Every file changed has a corresponding one-line summary in the commit message body. If split across multiple commits, every commit satisfies this per its own changes.

**Result:** [ ] Pass  [ ] Fail
**Notes:**

---

## Summary

| Scenario                                        | Result | Notes |
|-------------------------------------------------|--------|-------|
| Scenario 1 — Three product/* edits landed       |        |       |
| Scenario 2 — Commit message per-file summaries  |        |       |

**Overall verdict:** [ ] All pass — ready to proceed
[ ] Failures found — log findings below before proceeding

---

## Findings

| Scenario | Expected | Actual | Severity | Action |
|----------|----------|--------|----------|--------|
|          |          |        | HIGH / MED / LOW | Fix AC / Fix implementation / Accept |
