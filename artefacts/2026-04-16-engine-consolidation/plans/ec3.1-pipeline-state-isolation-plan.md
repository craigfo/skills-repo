# Relocate pipeline-state from `.github/` root to per-artefact — Implementation Plan

> **For agent execution:** Use /subagent-execution (if subagents available)
> or /tdd per task if executing in this session.

**Goal:** Relocate pipeline-state writes from a single root `.github/pipeline-state.json` to per-artefact `artefacts/<feature-slug>/pipeline-state.json`, with a derived aggregate rebuilt by a scanner. Add `featureStatus` enum; retain completed-feature files.
**Branch:** `feature/ec3.1-pipeline-state-isolation`
**Worktree:** `.worktrees/ec3.1-pipeline-state-isolation`
**Test command:** `cd cli && npx vitest run` (unit/integration) + `node scripts/build-pipeline-state.js` (scanner) + root `npm test` for regression sweep

---

## Scope preview (for operator review before execution)

**8 ACs (AC0–AC7). ~12 tasks. Estimated agent work: 3–4 hours.**

Blast radius:
- **Schema:** 1 file, 1 additive field (`.github/pipeline-state.schema.json`)
- **Scanner:** 1 new script (~150–200 lines)
- **Skill write-targets:** ~25 `.github/skills/*/SKILL.md` files (1–4 lines each in the state-update section)
- **Viz:** 1 one-line constant change
- **DoD skill:** 1 addition for `featureStatus: complete` write
- **Test suite:** 1 new vitest file (~300 lines)
- **Legacy fixture:** already captured at `tests/fixtures/pipeline-state-legacy.json` during /branch-setup (3157 lines, 5 features)
- **Root file:** either deleted (option A) or replaced with ≤10-line pointer doc (option B — operator choice at Task 8)
- **Plans folder:** implementation plan (this file) + AC0 audit (Task 1)

---

## Operator decision points

Three explicit choices before execution begins. All listed here so the plan is actionable end-to-end.

1. **AC5 root-file disposition — A (delete) or B (pointer doc):** Story allows exactly one. Recommendation: **B (pointer doc)** for discoverability — any tool or script that still references `.github/pipeline-state.json` will read the pointer rather than 404.
2. **Scanner script name:** Story references `scripts/build-pipeline-state.js` as a placeholder. Recommendation: adopt that name as-is — it is descriptive and follows the existing `scripts/*.js` convention.
3. **Commit granularity:** Two options — (a) one batch commit for all ~25 SKILL.md rewrites (surgical, easy to review as a pattern), or (b) one commit per skill family (adapter skills, engine skills, governance skills). Recommendation: **(a) batch commit** because the change is mechanical (write-path find/replace) and the audit table in Task 1 makes the pattern visible.

---

## File map

```
Create:
  scripts/build-pipeline-state.js                                 — scanner: walks artefacts/*/pipeline-state.json, emits derived aggregate
  cli/tests/engine/pipeline-state/migration.test.ts               — 13 tests (7 unit + 4 integration + 2 NFR) per test plan
  artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md
                                                                   — AC0 slug-detection audit table (produced in Task 1)

Modify:
  .github/pipeline-state.schema.json                              — add featureStatus enum (additive)
  .github/skills/*/SKILL.md (~25 files)                           — state-update section: .github/pipeline-state.json → artefacts/<feature-slug>/pipeline-state.json
  .github/skills/definition-of-done/SKILL.md                      — add featureStatus: "complete" write on DoD
  .github/pipeline-viz.html                                       — one-line input-path constant
  package.json (root)                                             — add scanner + migration test to the test chain

Delete OR replace (Task 8 — operator choice):
  .github/pipeline-state.json                                     — either git rm, or replace with ≤10-line pointer doc

Do not touch:
  cli/src/*                                                        — CLI internals unchanged (pipeline-state is a governance artefact, not a CLI runtime concern)
  product/*                                                        — ec2.2's scope
  CONTRIBUTING.md                                                  — ec2.1's scope; subsection 7 coordinates with this story's merge
  Other src/* subcomponents                                        — each owned by an ec1.x story
```

---

## Task 1: Produce the AC0 slug-detection audit

**Purpose:** AC0 gates the rest of the story. Every pipeline-state-writing skill must either already derive the active feature-slug from its invocation context or be patched to do so within ec3.1. This task produces the audit table that drives Task 5 (localised patches).

**Files:**
- Create: `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md`

**Audit procedure:**

- [ ] **Step 1: Enumerate pipeline-state writers**

```bash
grep -rln "pipeline-state\|pipelineState" .github/skills/ scripts/ cli/src/ | sort -u > /tmp/ec3.1-writers.txt
wc -l /tmp/ec3.1-writers.txt
```

Expected output: ~36 files total, of which ~25 have write-path instructions in `## State update — mandatory final step` sections.

- [ ] **Step 2: For each SKILL.md with a state-update section, extract slug-derivation mechanism**

For each skill file identified in Step 1, grep the `## State update` section for how the skill identifies the current feature-slug. Four expected patterns:

1. **Context-derived from branch name** (e.g. reads `git branch --show-current` and parses `feature/<slug>`)
2. **Context-derived from cwd** (e.g. reads `process.cwd()` and walks up until an `artefacts/<slug>/` folder is found)
3. **Explicit parameter from operator** (e.g. skill prompts operator for the feature slug or reads it from state.json's `activeFeature.slug`)
4. **n/a — read-only** (skill reads state but does not write; e.g. `/workflow`, `/trace`)

- [ ] **Step 3: Populate the audit table**

Write to `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md` using this template:

```markdown
# AC0 Slug-Detection Audit — ec3.1

**Date:** 2026-04-17
**Total writers inspected:** [N]
**Writers needing patch:** [N]
**Writers already context-aware:** [N]
**Read-only (no patch needed):** [N]

| Skill / helper | Slug-derivation mechanism | Status | Patch needed? |
|----------------|---------------------------|--------|---------------|
| .github/skills/discovery/SKILL.md | cwd walks up to artefacts/<slug>/ | already-present | no |
| .github/skills/definition/SKILL.md | reads workspace/state.json activeFeature.slug | already-present | no |
| ... | ... | ... | ... |

## Summary

- Already context-aware: [N] skills — no patch required
- Needs localised patch (one-line read-current-slug helper): [N] skills — listed in Task 5
- Read-only: [N] skills — state-write path not applicable

## Escalation trigger

If the "needs localised patch" count exceeds **3**, split a follow-up story ec3.0 per /decisions (Q5 revisit trigger). In that case: stop ec3.1 at Task 1, open a PR comment describing the gap, and request operator input before proceeding to Task 2.
```

- [ ] **Step 4: Commit**

```bash
git add artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md
git commit -m "feat(ec3.1): AC0 slug-detection audit table"
```

**Exit criterion:** Every row in the audit table is filled with a non-blank mechanism and status. No row reads `unknown`. If ≥4 skills need net-new infrastructure, stop and flag operator.

---

## Task 2: Add `featureStatus` enum to the schema (AC7)

**Files:**
- Modify: `.github/pipeline-state.schema.json`

- [ ] **Step 1: Write failing test**

Add to `cli/tests/engine/pipeline-state/migration.test.ts`:

```typescript
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("AC7 — Schema delta is one additive change", () => {
  test("featureStatus property exists as an enum on the feature record", () => {
    const schema = JSON.parse(readFileSync("./.github/pipeline-state.schema.json", "utf8"));
    // Feature record is the items schema of the top-level `features` array
    const featureRecord = schema.properties?.features?.items || schema.definitions?.feature;
    expect(featureRecord).toBeDefined();
    expect(featureRecord.properties?.featureStatus).toMatchObject({
      enum: ["in-flight", "complete"],
    });
  });

  test("no existing feature-record property has been removed or retyped", () => {
    const schema = JSON.parse(readFileSync("./.github/pipeline-state.schema.json", "utf8"));
    const featureRecord = schema.properties?.features?.items || schema.definitions?.feature;
    // Fields known to exist pre-migration; list assembled from legacy fixture
    const required = ["slug", "name", "stage", "health", "updatedAt"];
    for (const field of required) {
      expect(featureRecord.properties).toHaveProperty(field);
    }
  });
});
```

- [ ] **Step 2: Run test — must fail**

```bash
cd cli && npx vitest run tests/engine/pipeline-state/migration.test.ts
```

Expected: AC7-U1 fails with "featureStatus property missing"; AC7-U2 passes (existing fields present).

- [ ] **Step 3: Update schema**

Edit `.github/pipeline-state.schema.json`. Find the feature-record sub-schema (under `properties.features.items` or `definitions.feature`). Add:

```json
"featureStatus": {
  "type": "string",
  "enum": ["in-flight", "complete"],
  "description": "Set to 'complete' by /definition-of-done on feature completion. File is retained (not deleted) after this transition."
}
```

- [ ] **Step 4: Run test — must pass**

```bash
cd cli && npx vitest run tests/engine/pipeline-state/migration.test.ts
```

Expected: both AC7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add .github/pipeline-state.schema.json cli/tests/engine/pipeline-state/migration.test.ts
git commit -m "feat(ec3.1): add featureStatus enum to pipeline-state schema (AC7)"
```

---

## Task 3: Implement the scanner (AC2)

**Files:**
- Create: `scripts/build-pipeline-state.js`
- Modify: `cli/tests/engine/pipeline-state/migration.test.ts` — add AC2 tests

- [ ] **Step 1: Write failing tests** — AC2 unit (synthetic fixture union-equality) + AC2 integration (live-repo union against legacy fixture). Full test code: see test plan AC2 section.

- [ ] **Step 2: Run tests — must fail** (scanner doesn't exist yet)

- [ ] **Step 3: Implement scanner**

```javascript
#!/usr/bin/env node
// scripts/build-pipeline-state.js
// Walks artefacts/*/pipeline-state.json, emits a derived aggregate.
// AC2: features[] array is the union of per-artefact inputs, ordered by updatedAt desc.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] || process.cwd();
const ARTEFACTS_DIR = join(ROOT, "artefacts");
const OUTPUT_PATH = join(ROOT, ".github/pipeline-state.derived.json");

if (!existsSync(ARTEFACTS_DIR)) {
  console.error(`No artefacts/ directory at ${ARTEFACTS_DIR}`);
  process.exit(1);
}

const features = [];
for (const entry of readdirSync(ARTEFACTS_DIR)) {
  const dir = join(ARTEFACTS_DIR, entry);
  if (!statSync(dir).isDirectory()) continue;
  const statePath = join(dir, "pipeline-state.json");
  if (!existsSync(statePath)) continue;
  try {
    const content = JSON.parse(readFileSync(statePath, "utf8"));
    // Tolerate both single-feature and features[]-array shapes for forward compat
    if (Array.isArray(content.features)) {
      features.push(...content.features);
    } else if (content.slug) {
      features.push(content);
    }
  } catch (err) {
    console.error(`Skipping malformed state at ${statePath}: ${err.message}`);
  }
}

features.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

const derived = {
  version: "1",
  updated: new Date().toISOString(),
  derivedFrom: "scanner",
  features,
};

writeFileSync(OUTPUT_PATH, JSON.stringify(derived, null, 2) + "\n");
console.log(`Scanner: wrote ${features.length} features to ${OUTPUT_PATH}`);
```

- [ ] **Step 4: Run tests — must pass**

```bash
node scripts/build-pipeline-state.js && cd cli && npx vitest run tests/engine/pipeline-state/migration.test.ts -t "AC2"
```

Expected: synthetic union-equality and live-repo integration both pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pipeline-state.js cli/tests/engine/pipeline-state/migration.test.ts
git commit -m "feat(ec3.1): scanner — derive aggregate from per-artefact pipeline-state (AC2)"
```

---

## Task 4: Rewrite SKILL.md state-write paths (AC1)

**Files:**
- Modify: ~25 `.github/skills/*/SKILL.md` files (exact list from Task 1 audit)

**Approach:** Mechanical find/replace on the "State update — mandatory final step" section of each SKILL.md. For every writer skill:

Before:
```
Update `.github/pipeline-state.json` in the **project repository**
```

After:
```
Update `artefacts/<current-feature-slug>/pipeline-state.json` in the **project repository**.
The current-feature-slug is derived from [mechanism per AC0 audit — branch name, cwd walk, or activeFeature.slug].
Legacy reference: `.github/pipeline-state.json` is now a read-only pointer document (see AC5). Writes to it are forbidden.
```

- [ ] **Step 1: Write failing tests** (AC1 unit tests in migration.test.ts — grep for `.github/pipeline-state.json` in write paths; assert zero matches)

- [ ] **Step 2: Run AC1 tests — must fail** (writes still target root file)

- [ ] **Step 3: Apply the rewrite**

Recommended: write a small node script (`/tmp/ec3.1-rewrite-skills.mjs`) that reads each audit-identified SKILL.md, locates the `## State update — mandatory final step` section, and applies the replacement. Execute, review diff, iterate if needed.

- [ ] **Step 4: Run AC1 tests — must pass**

- [ ] **Step 5: Commit** (batch per operator decision 3 above — default: single commit for all SKILL.md rewrites)

```bash
git add .github/skills/*/SKILL.md
git commit -m "feat(ec3.1): migrate all skill state-writes to per-artefact path (AC1)"
```

---

## Task 5: Apply localised slug-derivation patches

**Files:** Depends on Task 1 audit. Typically ≤3 SKILL.md files with additional lines to read the current slug.

**Gate:** If Task 1 audit surfaced ≥4 skills needing net-new detection infrastructure, **stop here and flag the operator** per /decisions Q5 revisit trigger (split ec3.0).

- [ ] **Step 1: For each `added-in-ec3.1` row from Task 1 audit,** add the slug-derivation stanza to the relevant SKILL.md's state-update section.

Typical stanza:
```
Before writing, derive the current feature-slug:
1. Try `git branch --show-current` — if it matches `feature/<slug>` or `feature/<slug>-*`, strip the prefix.
2. If not on a feature branch, walk up from cwd until an `artefacts/<slug>/` directory is found.
3. If neither resolves, halt with error "ec3.1 slug-derivation: cannot determine current feature-slug from branch or cwd."
```

- [ ] **Step 2: Commit**

```bash
git add .github/skills/*/SKILL.md
git commit -m "feat(ec3.1): add slug-derivation patches to N skills (AC0)"
```

---

## Task 6: Update viz input path (AC3)

**Files:**
- Modify: `.github/pipeline-viz.html`

- [ ] **Step 1: Write failing test** — AC3 unit/integration from test plan.

- [ ] **Step 2: Find the input-path constant.** One-line edit — current value `.github/pipeline-state.json` → new value `.github/pipeline-state.derived.json`.

- [ ] **Step 3: Run tests — must pass.**

- [ ] **Step 4: Manual verification** — serve `.github/pipeline-viz.html` locally, load in a browser, spot-check that feature cards render (matches Scenario 3 of the verification script).

- [ ] **Step 5: Commit**

```bash
git add .github/pipeline-viz.html
git commit -m "feat(ec3.1): viz reads derived pipeline-state aggregate (AC3)"
```

---

## Task 7: Add DoD skill featureStatus write (AC4)

**Files:**
- Modify: `.github/skills/definition-of-done/SKILL.md`

- [ ] **Step 1: Write failing tests** — AC4 unit + integration.

- [ ] **Step 2: Add featureStatus write to the DoD State-update section**

Append to the state-update section:
```
On DoD sign-off, set:
- `featureStatus: "complete"` at the top-level of `artefacts/<feature-slug>/pipeline-state.json`
- DO NOT delete or move the file. It is retained as the audit record.
```

- [ ] **Step 3: Run tests — must pass.**

- [ ] **Step 4: Commit**

```bash
git add .github/skills/definition-of-done/SKILL.md
git commit -m "feat(ec3.1): DoD marks featureStatus=complete on feature sign-off (AC4)"
```

---

## Task 8: Root file disposition (AC5) — **OPERATOR CHOICE**

**Files:**
- Delete OR modify: `.github/pipeline-state.json`

**Gate:** Operator must confirm option A (delete) or option B (pointer doc) before executing. Default: option B.

- [ ] **Option A (delete):**

```bash
git rm .github/pipeline-state.json
git commit -m "feat(ec3.1): remove root pipeline-state.json — derived aggregate replaces it (AC5)"
```

- [ ] **Option B (pointer doc):** Replace file content with ≤10-line pointer document.

```json
{
  "_pointer": "Pipeline state is per-artefact since ec3.1 (2026-04-17). This file is a pointer.",
  "_writes": "forbidden — writes to this path are rejected by /definition-of-ready H-ec3 check",
  "_reads": "use .github/pipeline-state.derived.json — regenerated by scripts/build-pipeline-state.js",
  "_perArtefact": "artefacts/<feature-slug>/pipeline-state.json",
  "_schema": ".github/pipeline-state.schema.json",
  "_featureStatus": "in-flight | complete (set by DoD)"
}
```

Commit:
```bash
git add .github/pipeline-state.json
git commit -m "feat(ec3.1): replace root pipeline-state with pointer doc (AC5 option B)"
```

- [ ] **AC5 unit test** must pass: exactly one of delete or ≤10-line pointer.

---

## Task 9: NFR tests and full suite pass (AC4 backward-readability, scanner runtime)

**Files:**
- Modify: `cli/tests/engine/pipeline-state/migration.test.ts` — add NFR tests

- [ ] **Step 1:** Add scanner-runtime-under-1s NFR test per test plan.
- [ ] **Step 2:** Add backward-readability NFR test (legacy entries without featureStatus survive the scanner).
- [ ] **Step 3:** Run full `cd cli && npx vitest run tests/engine/pipeline-state/` — all 13 tests pass.
- [ ] **Step 4:** Run root `npm test` — only the 7 pre-existing p3.14 failures remain. No new failures.
- [ ] **Step 5:** Commit NFR test additions:

```bash
git add cli/tests/engine/pipeline-state/migration.test.ts
git commit -m "feat(ec3.1): NFR tests — scanner runtime + backward readability"
```

---

## Task 10: Wire scanner into package.json test chain

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1:** Add `node scripts/build-pipeline-state.js --verify` to the root test chain (or a lint-equivalent invocation) so CI re-runs the scanner on every PR.
- [ ] **Step 2:** Run `npm test` at the root — confirm the scanner exits 0.
- [ ] **Step 3:** Commit:

```bash
git add package.json
git commit -m "chore(ec3.1): wire scanner into root test chain"
```

---

## Task 11: End-to-end verification and AC round-trip (AC6)

**Files:** No new files — runs the verification script.

- [ ] **Step 1:** Invoke one real skill (e.g. `/workflow` or a stub state-writer) from the worktree. Observe `git diff --name-only` — expected: `artefacts/2026-04-16-engine-consolidation/pipeline-state.json` changes; `.github/pipeline-state.json` does NOT (it is the pointer doc from AC5 option B, or absent).
- [ ] **Step 2:** Walk through `artefacts/2026-04-16-engine-consolidation/verification-scripts/ec3.1-pipeline-state-isolation-verification.md` — mark each scenario pass/fail.
- [ ] **Step 3:** If any scenario fails, loop back to the relevant task and fix. Otherwise, close out.

No commit needed — verification is a read-only confirmation.

---

## Task 12: Run /verify-completion

Per the DoR instructions, after all tasks complete:

```bash
# at the worktree root
cd cli && npx vitest run                       # all 50 + 13 = 63 tests must pass
cd .. && npm test                               # root chain: 7 pre-existing p3.14 failures only
node scripts/build-pipeline-state.js           # scanner produces derived file
```

If clean, move to `/branch-complete` to open the draft PR.

---

## Task summary

| Task | AC(s) covered | Commits | Operator decision gate |
|------|---------------|---------|------------------------|
| 1 | AC0 | 1 (audit) | ⚠️ if ≥4 skills need net-new infrastructure → split ec3.0 |
| 2 | AC7 | 1 | — |
| 3 | AC2 | 1 | — |
| 4 | AC1 | 1 (batch) | — (or per decision 3: split by skill family) |
| 5 | AC0 (patches) | 1 | — |
| 6 | AC3 | 1 | — |
| 7 | AC4 | 1 | — |
| 8 | AC5 | 1 | ⚠️ operator choice: delete (A) or pointer (B) |
| 9 | AC4 (NFR) | 1 | — |
| 10 | — (wiring) | 1 | — |
| 11 | AC6 | 0 (verification) | — |
| 12 | — (/verify-completion) | 0 | — |

**Total commits expected:** ~9 (one per AC-covering task).

---

## Risks and rollback

- **AC0 audit surfaces scope blow-up:** Stop at Task 1. Flag operator. Split ec3.0.
- **Schema change breaks an unrelated reader:** AC7 unit test should catch. If caught at root test chain, revert the schema commit and reassess.
- **Scanner runtime > 1s on ≤10 features:** Task 3 NFR test should catch. Investigate; cache per-artefact mtimes if needed. If unfixable in scope, revisit /decisions Q5.
- **Viz renders blank after Task 6:** Scenario 3 of verification catches. Revert to pre-migration input-path constant and investigate; the one-line change should be surgical.
- **Full rollback:** All commits are atomic; `git revert` any task-scoped commit returns the worktree to a consistent state. If cascading revert is needed, `git reset --hard` to the pre-Task-1 SHA on this worktree branch (feature/ec3.1-pipeline-state-isolation only — does not affect other stories' branches).
