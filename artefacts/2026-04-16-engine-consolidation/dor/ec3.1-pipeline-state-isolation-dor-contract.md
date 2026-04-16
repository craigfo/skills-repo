# DoR Contract Proposal: Relocate pipeline-state from .github/ root to per-artefact

**Story:** `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md`
**Date:** 2026-04-17
**Status:** Reviewed ✅ — aligns with all 8 ACs (AC0–AC7). AC0 is the first implementation step.

---

## What will be built

1. **AC0 audit table** in `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md` — one row per pipeline-state-writing skill/helper, each marked `already-present` / `added-in-ec3.1` / `n/a-read-only`. The audit gates the scope of localised slug-derivation patches.
2. **Schema update** — add `featureStatus` enum field to `.github/pipeline-state.schema.json` (additive only, enum values `["in-flight", "complete"]`).
3. **Scanner script** — `scripts/build-pipeline-state.js` (name TBD at implementation) walks `artefacts/*/pipeline-state.json`, unions features by slug, sorts by `updatedAt` descending, writes the aggregate to `.github/pipeline-state.derived.json`.
4. **Skill/helper write-target rewrites** — every `.github/skills/*/SKILL.md` state-update section changes from `.github/pipeline-state.json` to `artefacts/<current-feature-slug>/pipeline-state.json`. Associated helpers (if any) similarly updated.
5. **Viz input path constant change** — one-line edit to `pipeline-viz.html` pointing at `.github/pipeline-state.derived.json`.
6. **Root file disposition** — operator chooses at implementation time: (a) delete `.github/pipeline-state.json` (history via relocation commit) OR (b) replace with ≤ 10-line pointer document. Preferred: (b) for discoverability.
7. **DoD skill update** — `.github/skills/definition-of-done/SKILL.md` adds a step: on DoD sign-off, write `featureStatus: "complete"` to the artefact's pipeline-state file; file is retained.
8. **Test suite** — new `cli/tests/engine/pipeline-state/migration.test.ts` with 7 unit + 4 integration + 2 NFR assertions per the test plan.

## What will NOT be built

- **Write-locking / advisory file-lock mechanisms.** Per-artefact sharding removes contention structurally.
- **Migration of historical completed features** into per-artefact files. Retained legacy root file (pointer variant) references them.
- **`pipeline-viz.html` rendering-logic changes.** Input path only.
- **New metrics beyond MM4.** MM4(b) 30-day observational window is tracked on the benefit-metric sheet, not gated by this story.
- **Net-new slug-detection infrastructure.** AC0 covers the in-scope audit and localised patches; net-new infrastructure splits to a follow-up story if the audit requires it.

## How each AC will be verified

| AC  | Test approach | Type |
|-----|---------------|------|
| AC0 | Unit — plan file has audit table with ≥ 1 row per state-writing skill, every row non-blank. Manual (Scenario 0) — reviewer cross-checks the audit against grep output of actual writers. | unit + manual |
| AC1 | Unit (two checks) — zero write-path matches for `.github/pipeline-state.json` in write code; every residual match is annotated with `read-only` / `scanner` / `archival` / `aggregate` / `derived`. | unit |
| AC2 | Unit — scanner output against synthetic fixture union-equals inputs. Integration — scanner against live repo state matches legacy fixture on overlapping features. | unit + integration |
| AC3 | Integration — either headless-browser render OR path-constant textual assertion. Manual (Scenario 3) — operator loads viz in a real browser and spot-checks. | integration + manual |
| AC4 | Unit — stub DoD invocation writes `featureStatus: "complete"`; file still tracked. Integration — full DoD round-trip. | unit + integration |
| AC5 | Unit — disposition is exactly one of delete-with-history OR ≤ 10-line pointer doc with required substrings. | unit |
| AC6 | Integration — stub skill invocation diff shows per-artefact file changed, root file not. Manual (Scenario 6) — operator repeats with a real in-flight skill. | integration + manual |
| AC7 | Unit — schema diff is exactly one additive block (`featureStatus` enum); no existing fields removed, renamed, or retyped. | unit |

## Assumptions

- **AC0 audit surfaces ≤ 2 net-new-infrastructure gaps.** If ≥ 3 skills need net-new detection (not localised patches), ec3.0 splits out per /decisions revisit trigger.
- **Per-artefact write paths are deterministic at skill-invocation time.** The AC0 audit confirms each writer can derive `<current-feature-slug>` from branch / cwd / explicit parameter. If any writer cannot, a localised patch lands in this story.
- **No concurrent PR will touch the schema file** during ec3.1 implementation. The AC7 "exactly one additive change" invariant presumes no other schema edits land in the same PR.
- **Scanner runtime on the current artefacts tree (~4-5 features) is well below the 1-second floor.** If the artefacts tree grows 10× before ec3.1 ships, revisit (Q5 revisit trigger).
- **Legacy fixture is captured pre-cut-over.** Before implementation begins, the operator captures a snapshot of current `.github/pipeline-state.json` as `tests/fixtures/pipeline-state-legacy.json` so AC2 has something to union-equal against.

## Estimated touch points

**Files modified:**
- `.github/pipeline-state.schema.json` — one additive field
- `.github/skills/*/SKILL.md` (estimated 8–10 files) — state-update section write path
- `.github/skills/*/SKILL.md` helpers (if any — TBD by AC0 audit)
- `pipeline-viz.html` — one-line input-path constant
- `.github/skills/definition-of-done/SKILL.md` — add featureStatus: complete write

**Files added:**
- `scripts/build-pipeline-state.js` — scanner (~150–200 lines)
- `cli/tests/engine/pipeline-state/migration.test.ts` — test suite (~300 lines)
- `tests/fixtures/pipeline-state-legacy.json` — pre-cut-over snapshot (data)
- `artefacts/2026-04-16-engine-consolidation/plans/ec3.1-plan.md` — implementation plan with AC0 audit table

**Files removed OR replaced:**
- `.github/pipeline-state.json` — either deleted (history via relocation commit) OR replaced with ≤ 10-line pointer document

**Files created during operation (not committed at implementation time):**
- `artefacts/<slug>/pipeline-state.json` — per-artefact state files, created as each feature's skills run

**Services:** None.
**APIs:** None.

## Scope contract — do NOT touch

- Other `src/*` subcomponents (ec1.x stories own them)
- `product/*` files (ec2.2's scope)
- `CONTRIBUTING.md` (ec2.1's scope; subsection 7 depends on this story — coordinate merge order)
- `.github/architecture-guardrails.md` unless a new ADR is added for the control-plane state-write rule (optional enhancement, out of story scope)
- Pipeline-state write code in any feature/*/ branch other than this one (would cause the AC1 grep to find in-flight branch writes — handle via rebase, not cross-branch edits)

## Sequencing declaration

```yaml
sequencingDepends: none-upstream
downstreamOfMerging:
  - ec2.1 subsection 7 (CONTRIBUTING.md pipeline-state coordination paragraph)
  - all future features' pipeline runs
mergeOrderNote: |
  ec3.1 should land before ec2.1 ships subsection 7, or ec2.1 ships without
  subsection 7 and adds it in a follow-up PR. Either is acceptable per
  AC1a sequencing guard in ec2.1.
schemaDepends: []
reason: AC7 confirms no upstream schema dependency; delta is internal (additive).
```

## Expected diff size

- Scanner: ~150–200 lines (new)
- Test suite: ~300 lines (new)
- SKILL.md writes across 8–10 skills: ~2–4 lines each = ~20–40 lines
- Schema delta: ~3 lines
- Viz HTML: 1 line
- DoD SKILL.md addition: ~5 lines
- Legacy fixture: ~200–500 lines (data, committed once)
- Implementation plan + audit table: ~150 lines (new)

Total: ~800–1,200 lines (dominated by test suite + legacy fixture). Schema change is the smallest substantive edit.
