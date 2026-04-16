# Definition of Ready Checklist

## Definition of Ready: Migrate src/surface-adapter/ → cli/src/adapters/surface-adapter/

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec1.1-surface-adapter-migration.md`
**Test plan reference:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec1.1-surface-adapter-migration-test-plan.md`
**Verification script reference:** `artefacts/2026-04-16-engine-consolidation/verification-scripts/ec1.1-surface-adapter-migration-verification.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec1.1-surface-adapter-migration-review-1.md` — PASS, 0 HIGH / 0 MEDIUM / 3 LOW.
**Contract proposal:** `artefacts/2026-04-16-engine-consolidation/dor/ec1.1-surface-adapter-migration-dor-contract.md`
**Assessed by:** Copilot (Claude Opus 4.6)
**Date:** 2026-04-17

---

## Contract Review

✅ **Contract review passed** — proposed implementation aligns with all 6 ACs. See `ec1.1-surface-adapter-migration-dor-contract.md` for the negotiated contract proposal (components, scope boundary, per-AC test approach, assumptions, touch points).

---

## Hard Blocks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| H1 | User story in As / Want / So with named persona | ✅ | Persona: productisation-thread contributor. |
| H2 | ≥ 3 ACs in Given / When / Then | ✅ | 6 ACs, all G/W/T. |
| H3 | Every AC has a test | ✅ | 4 unit + 1 integration + 1 NFR + 2 manual scenarios map 1:1 to 6 ACs (see test plan AC coverage table). |
| H4 | Out-of-scope populated | ✅ | 4 explicit out-of-scope items (behaviour change, test rewrite, SKILL.md content, .github/scripts collapse). |
| H5 | Benefit linkage references a named metric | ✅ | M1, M2, M4, MM1 referenced. |
| H6 | Complexity rated | ✅ | Rating: 2, Scope stability: Stable. |
| H7 | No unresolved HIGH findings | ✅ | Review-1 result: 0 HIGH. |
| H8 | No uncovered ACs in test plan | ✅ | AC coverage table in test plan shows full coverage; gaps (AC1 operator-capture, AC6 PR metadata) documented with handling. |
| H8-ext | Schema dependency check | ✅ | Story declares Upstream: None — schema check not required. |
| H9 | Architecture Constraints populated; no Category E HIGH | ✅ | MC-CLI-01, AP-11, ADR-011 referenced. Review Category E: 0 HIGH. |
| H-E2E | No CSS-layout-dependent ACs | ✅ | CLI + file ops only — no UI in scope. |
| H-NFR | NFR profile exists OR story explicit 'None' | ✅ | nfr-profile.md exists at feature level; covers Performance / Security / Data classification. |
| H-NFR2 | Compliance NFR with regulatory clause signed off | ✅ | No compliance NFRs declared (regulated: false per context.yml). |
| H-NFR3 | Data classification not blank | ✅ | Data classification: Public (feature-wide). |
| H-NFR-profile | NFR profile presence matches story NFR section | ✅ | Story NFRs populated; profile exists. |

**Result:** 15 / 15 passed.

---

## Warnings

| # | Check | Status | Notes / Acknowledgement |
|---|-------|--------|-------------------------|
| W1 | NFRs identified or 'None — confirmed' | ✅ | Performance, Security, Accessibility (N/A), Audit all addressed. |
| W2 | Scope stability declared | ✅ | Stable. |
| W3 | MEDIUM review findings acknowledged in /decisions | ✅ | No MEDIUMs raised for this story. |
| W4 | Verification script reviewed by domain expert | ⚠️ ack | Solo project: operator is the domain expert. Self-review will occur at PR time before merge. Logged as RISK-ACCEPT via /decisions review-response entry (2026-04-17 DoR run) — named operator check at PR. |
| W5 | No UNCERTAIN items in test-plan gap table | ✅ | Gap table entries have explicit reasons and mitigations; none marked UNCERTAIN. |

**W4 acknowledgement:** Solo-operator project. Verification script will be self-reviewed at PR time before merge. RISK-ACCEPT logged in /decisions on 2026-04-17 (DoR run batch).

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: Migrate src/surface-adapter/ → cli/src/adapters/surface-adapter/ — artefacts/2026-04-16-engine-consolidation/stories/ec1.1-surface-adapter-migration.md
Test plan: artefacts/2026-04-16-engine-consolidation/test-plans/ec1.1-surface-adapter-migration-test-plan.md
Verification script: artefacts/2026-04-16-engine-consolidation/verification-scripts/ec1.1-surface-adapter-migration-verification.md

Goal:
Move every file under src/surface-adapter/ into cli/src/adapters/surface-adapter/ via git mv (preserving
history). Move the associated test file(s) (.github/scripts/check-surface-adapter.js)
into cli/tests/adapters/surface-adapter/. Rewrite any imports inside the moved tests from the old
path to the new one. Do not change interfaces, runtime behaviour, or test content
beyond import-path edits.

Expected touchpoints (files to modify):
- src/surface-adapter/** → cli/src/adapters/surface-adapter/** (git mv — 8 subfiles: index.js, resolver.js, adapters/git-native.js, adapters/iac.js, adapters/saas-api.js, adapters/saas-gui.js, adapters/m365-admin.js, adapters/manual.js)
- .github/scripts/check-surface-adapter.js → cli/tests/adapters/surface-adapter/check-surface-adapter.js (git mv)
- Imports inside moved tests: rewrite old path → new path
- package.json test chain (repo root): update the script path for the moved test
- New test file: cli/tests/adapters/surface-adapter/migration-invariants.test.ts (5 assertions per test plan unit section)

Out of scope for this story (do not touch):
- Any behaviour change to surface-adapter
- Tests other than those listed above
- SKILL.md / standards / POLICY.md content
- Other src/*/ subcomponents (they have their own ec1.x stories)
- .github/scripts/ beyond the specific test file being co-located (per /decisions Q3)

Constraints:
- Use git mv, not rm + add — audit NFR (git log --follow) depends on it
- All 6 ACs must be verifiable before opening the PR
- Open a draft PR when tests pass — do not mark ready for review
- PR description must include pre- and post-migration snapshots side by side (AC6)
- Architecture standards: read .github/architecture-guardrails.md — MC-CLI-01 already
  honoured by default (this is build-time layout, not runtime)
- If you encounter an ambiguity not covered by the ACs or tests:
  add a PR comment describing the ambiguity and do not mark ready for review
- Pre/post test count + pass rate MUST match exactly (AC5, per /decisions Q2)
  — if they diverge, the move introduced behaviour change and the PR blocks

Oversight level: Medium — share the DoR artefact with the tech lead before starting.
(Solo project: operator is the tech lead; self-acknowledged on 2026-04-17.)
```

---

## Sign-off

**Oversight level:** Medium
**Sign-off required:** No (Medium — tech lead awareness only)
**Acknowledged by:** Operator (tech lead + contributor, solo scale), 2026-04-17
