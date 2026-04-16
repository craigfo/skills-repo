# Definition of Ready Checklist

## Definition of Ready: Relocate pipeline-state from .github/ root to per-artefact

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md`
**Test plan reference:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec3.1-pipeline-state-isolation-test-plan.md`
**Verification script reference:** `artefacts/2026-04-16-engine-consolidation/verification-scripts/ec3.1-pipeline-state-isolation-verification.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec3.1-pipeline-state-isolation-review-1.md` — PASS WITH CONDITIONS, 0 HIGH / 1 MEDIUM (resolved 2026-04-17) / 5 LOW.
**Contract proposal:** `artefacts/2026-04-16-engine-consolidation/dor/ec3.1-pipeline-state-isolation-dor-contract.md`
**Assessed by:** Copilot (Claude Opus 4.6)
**Date:** 2026-04-17

---

## Contract Review

✅ **Contract review passed** — proposed implementation aligns with all 8 ACs (AC0–AC7). AC0 audit table is the first implementation step and gates subsequent work: the audit output determines whether any skills need a localised slug-derivation patch within ec3.1's scope or whether all writers already derive context-appropriately.

---

## Hard Blocks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| H1 | User story in As / Want / So with named persona | ✅ | Persona: productisation-thread contributor running pipeline concurrently with Phase 3. |
| H2 | ≥ 3 ACs in Given / When / Then | ✅ | 8 ACs (AC0–AC7), all G/W/T. |
| H3 | Every AC has a test | ✅ | 7 unit + 4 integration + 2 NFR + 3 manual. AC0 has unit + manual; AC3 has integration + manual; AC6 has integration + manual. |
| H4 | Out-of-scope populated | ✅ | 5 explicit out-of-scope items including the revised (2026-04-17) statement on net-new slug-detection infrastructure. |
| H5 | Benefit linkage references a named metric | ✅ | MM4 (write-contention, a + b). |
| H6 | Complexity rated | ✅ | Rating: 3, Scope stability: Stable. |
| H7 | No unresolved HIGH findings | ✅ | 0 HIGH. Review MEDIUM M1 resolved 2026-04-17 via AC0 + /decisions entry. |
| H8 | No uncovered ACs in test plan | ✅ | All 8 ACs covered. Gaps (AC0 audit-completeness, AC3 render equivalence, AC6 stub vs real skill) documented with handling. |
| H8-ext | Schema dependency check | ✅ | Upstream: None structural. AC7 covers the schema delta internally (additive: featureStatus). No external upstream schemas declared. |
| H9 | Architecture Constraints populated; no Category E HIGH | ✅ | 3 constraints: no viz breakage, schema-additive only, in-flight feature preservation. Review Category E: 0 HIGH. |
| H-E2E | No CSS-layout-dependent ACs | ✅ | AC3 (viz render) is checked via path-constant + optional headless browser — not CSS-layout-dependent per the test plan's classification. |
| H-NFR | NFR profile exists OR story explicit 'None' | ✅ | Story NFRs: scanner runtime, backward readability. NFR profile at feature level covers the feature surface. |
| H-NFR2 | Compliance NFR with regulatory clause signed off | ✅ | None declared. |
| H-NFR3 | Data classification not blank | ✅ | Feature-wide: Public. |
| H-NFR-profile | NFR profile presence matches story NFR section | ✅ | Both present. |

**Result:** 15 / 15 passed.

---

## Warnings

| # | Check | Status | Notes / Acknowledgement |
|---|-------|--------|-------------------------|
| W1 | NFRs identified or 'None — confirmed' | ✅ | Performance, Security, Accessibility (N/A), Audit all addressed. |
| W2 | Scope stability declared | ✅ | Stable. |
| W3 | MEDIUM review findings acknowledged in /decisions | ✅ | M1 (slug-detection deferral) resolved 2026-04-17 via inline AC0 + /decisions review-response entry — fully logged. |
| W4 | Verification script reviewed by domain expert | ⚠️ ack | Solo project: operator is the domain expert. Self-review will occur at PR time before merge. Logged as RISK-ACCEPT via /decisions review-response entry (2026-04-17 DoR run) — named operator check at PR. |
| W5 | No UNCERTAIN items in test-plan gap table | ✅ | Three gaps flagged with handling: AC0 reviewer-audit, AC3 render verification (optional playwright), AC6 stub skill. None marked UNCERTAIN. |

**W4 acknowledgement:** Solo-operator — self-review at PR time. RISK-ACCEPT logged via /decisions on 2026-04-17.

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: Relocate pipeline-state to per-artefact — artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md
Test plan: artefacts/2026-04-16-engine-consolidation/test-plans/ec3.1-pipeline-state-isolation-test-plan.md
Verification script: artefacts/2026-04-16-engine-consolidation/verification-scripts/ec3.1-pipeline-state-isolation-verification.md

Goal:
Relocate pipeline-state writes from the single root .github/pipeline-state.json
to per-artefact files at artefacts/<feature-slug>/pipeline-state.json, with a
derived aggregate at .github/pipeline-state.derived.json rebuilt by a scanner.
Add schema field featureStatus: {"in-flight", "complete"} set by DoD; retain
completed-feature files.

Implementation sequence (mandatory order):
1. AC0 audit first — produce the slug-detection audit table in the
   implementation plan. Every pipeline-state-writing skill/helper gets a row
   marked already-present / added-in-ec3.1 / n/a-read-only. No row may read
   unknown.
2. Schema update — add featureStatus enum to pipeline-state.schema.json
   (additive only per AC7).
3. Scanner — implement scripts/build-pipeline-state.js (or equivalent name
   agreed in plan) producing the derived aggregate (AC2).
4. Skill/helper write-target updates — rewrite each writer to target
   artefacts/<slug>/pipeline-state.json (AC1). Add localised slug-derivation
   patches as identified in the AC0 audit.
5. Viz input path change — one-line constant update in pipeline-viz.html
   pointing at the derived file (AC3).
6. Root file disposition — EITHER delete .github/pipeline-state.json
   (history via the relocation commit) OR replace it with a ≤ 10-line pointer
   document (AC5). Operator chooses at implementation time; pointer-doc is
   preferred for discoverability.
7. DoD skill update — when feature reaches DoD, the artefact's
   pipeline-state.json must get featureStatus: "complete" and be retained
   (not deleted, not moved) (AC4).
8. Test suite — implement migration-invariants tests (7 unit + 4 integration
   + 2 NFR per test plan).

Out of scope:
- Write-locking / advisory file-lock mechanisms
- Migration of historical completed features into per-artefact files
- pipeline-viz.html rendering-logic changes (input path only)
- New metrics beyond MM4
- Net-new slug-detection infrastructure (localised patches only per AC0)

Constraints:
- Schema delta must be exactly one additive change (AC7)
- Every residual .github/pipeline-state.json reference in non-write paths
  (scanner input, archival reference) must be explicitly commented
- Backward readability NFR: scanner must tolerate missing featureStatus on
  legacy entries without error
- Scanner runtime < 1 second on ≤ 10 features
- Open a draft PR only after all 7 unit + 4 integration + 2 NFR tests pass
- ec2.1 subsection 7 (pipeline-state coordination) depends on this story
  landing — coordinate merge order with ec2.1's branch

Oversight level: Medium — share the DoR artefact with the tech lead before
starting. (Solo project: operator is the tech lead; self-acknowledged 2026-04-17.)
```

---

## Sign-off

**Oversight level:** Medium
**Sign-off required:** No (Medium — tech lead awareness only)
**Acknowledged by:** Operator (tech lead + contributor, solo scale), 2026-04-17
