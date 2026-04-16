# Definition of Ready: ps3.3-dogfood-acceptance-run — Dogfood acceptance run

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps3.3-dogfood-acceptance-run.md`
**Test plan reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/test-plans/ps3.3-dogfood-acceptance-run-test-plan.md`
**Contract:** `artefacts/2026-04-15-productise-cli-and-sidecar/dor/ps3.3-dogfood-acceptance-run-dor-contract.md`
**Assessed by:** Claude (via `/definition-of-ready`)
**Date:** 2026-04-15

---

## Contract Review

✅ **PASS** — proposed implementation covers every AC with a matching test approach; no scope mismatch against ACs or test plan.

---

## Hard Blocks

| # | Check | Status | Notes |
|---|---|---|---|
| H1 | User story As/Want/So + named persona | ✅ | Persona: skills-repo maintainer (operator) |
| H2 | ≥3 ACs in Given/When/Then | ✅ | All ACs G/W/T |
| H3 | Every AC has ≥1 test | ✅ | Coverage table in test plan |
| H4 | Out-of-scope populated | ✅ | Multiple items |
| H5 | Benefit linkage references named metric | ✅ | MM1 (primary), MM2, M2 (measurement) |
| H6 | Complexity rated | ✅ | 2 |
| H7 | No unresolved HIGH review findings | ✅ | Review Run 2: 0 HIGH, 0 MEDIUM |
| H8 | No uncovered ACs in test plan | ✅ | No gaps |
| H8-ext | schemaDepends vs pipeline-state.schema.json | ✅ | `schemaDepends: []` |
| H9 | Architecture Constraints + no Cat E HIGH | ✅ | Populated |
| H-E2E | CSS-layout-dependent + no E2E + no RISK-ACCEPT | ✅ | No CSS-layout-dependent ACs |
| H-NFR | NFR profile exists | ✅ | `nfr-profile.md` |
| H-NFR2 | Regulatory clause human sign-off | ✅ | No named regulatory clauses |
| H-NFR3 | Data classification not blank | ✅ | "Public" |
| H-NFR-profile | NFR profile presence if NFRs declared | ✅ | Profile exists |

**All hard blocks PASS.**

---

## Warnings

| # | Status | Acknowledged by |
|---|---|---|
| W1 NFRs populated | ✅ | — |
| W2 Scope stability declared | ✅ | — |
| W3 MEDIUM findings acknowledged | ✅ | — (0 MEDIUMs at Review Run 2) |
| W4 Verification script reviewed by domain expert | ⚠️ RISK-ACCEPT | Operator, 2026-04-15 (logged in decisions.md; dogfood-first per Q2) |
| W5 No UNCERTAIN items in test-plan gap table | ✅ | Gaps resolved inline |

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: ps3.3-dogfood-acceptance-run Dogfood acceptance run — artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps3.3-dogfood-acceptance-run.md
Test plan: artefacts/2026-04-15-productise-cli-and-sidecar/test-plans/ps3.3-dogfood-acceptance-run-test-plan.md
Contract: artefacts/2026-04-15-productise-cli-and-sidecar/dor/ps3.3-dogfood-acceptance-run-dor-contract.md

Goal:
Make every test in the test plan pass. Do not add scope, behaviour, or structure beyond what the tests and ACs specify.

Constraints:
- Node 18+, TypeScript, Vitest. npm as publish channel (packaging only — do NOT publish).
- Scope is limited to the Contract. "What will NOT be built" items are out of scope; if required, raise as a PR comment and do not expand.
- Architecture guardrails: read `.github/architecture-guardrails.md` before implementing.
- Open a draft PR when tests pass — do not mark ready for review.
- If ambiguous: PR comment, no ready-for-review.

Oversight level: Medium
```

---

## Sign-off

**Oversight level:** Medium
**Sign-off required:** No (solo delivery; tech-lead = operator)
**Signed off by:** Operator, 2026-04-15

---

## Outcome

✅ **READY TO PROCEED** — assign to coding agent via the instructions block above.
