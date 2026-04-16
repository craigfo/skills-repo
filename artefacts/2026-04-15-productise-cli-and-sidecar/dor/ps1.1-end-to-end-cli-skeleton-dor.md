# Definition of Ready: ps1.1 — End-to-end CLI skeleton

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps1.1-end-to-end-cli-skeleton.md`
**Test plan reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/test-plans/ps1.1-end-to-end-cli-skeleton-test-plan.md`
**Contract:** `artefacts/2026-04-15-productise-cli-and-sidecar/dor/ps1.1-end-to-end-cli-skeleton-dor-contract.md`
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
| H2 | ≥3 ACs in Given/When/Then | ✅ | 5 ACs, all G/W/T |
| H3 | Every AC has ≥1 test | ✅ | Coverage table in test plan |
| H4 | Out-of-scope populated | ✅ | 4 explicit items |
| H5 | Benefit linkage references named metric | ✅ | M1 (primary), MM1 (partial) |
| H6 | Complexity rated | ✅ | 2 |
| H7 | No unresolved HIGH review findings | ✅ | Review Run 2: 0 HIGH, 0 MEDIUM |
| H8 | Test plan has no uncovered ACs | ✅ | No gaps |
| H8-ext | schemaDepends declaration vs pipeline-state.schema.json | ✅ | `schemaDepends: []` — no upstream state fields consumed |
| H9 | Architecture Constraints populated; no Cat E HIGH | ✅ | Populated; guardrail-landing sequencing logged as ARCH decision |
| H-E2E | CSS-layout-dependent + no E2E tooling + no RISK-ACCEPT | ✅ | No CSS-layout-dependent ACs |
| H-NFR | NFR profile exists OR story has NFR="None" | ✅ | NFR profile at `nfr-profile.md`; story has 4 NFR items |
| H-NFR2 | Compliance NFR with clause has human sign-off | ✅ | No named regulatory clauses |
| H-NFR3 | Data classification field not blank | ✅ | "Public" |
| H-NFR-profile | NFR profile presence if NFRs declared | ✅ | Profile exists |

**All hard blocks PASS.**

---

## Warnings

| # | Status | Acknowledged by |
|---|---|---|
| W1 NFRs populated | ✅ | — |
| W2 Scope stability declared | ✅ | — |
| W3 MEDIUM findings acknowledged in /decisions | ✅ | — (0 MEDIUMs at Review Run 2) |
| W4 Verification script reviewed by domain expert | ⚠️ RISK-ACCEPT | Operator, 2026-04-15 (logged in decisions.md; dogfood-first per Q2) |
| W5 No UNCERTAIN items in test-plan gap table | ✅ | Gaps resolved inline |

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: ps1.1 End-to-end CLI skeleton — artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps1.1-end-to-end-cli-skeleton.md
Test plan: artefacts/2026-04-15-productise-cli-and-sidecar/test-plans/ps1.1-end-to-end-cli-skeleton-test-plan.md
Contract: artefacts/2026-04-15-productise-cli-and-sidecar/dor/ps1.1-end-to-end-cli-skeleton-dor-contract.md

Goal:
Make every test in the test plan pass. Do not add scope, behaviour, or structure beyond what the tests and ACs specify.

Constraints:
- Node 18+, TypeScript, Vitest as test runner. npm as publish channel (packaging only — do NOT publish).
- No fetch, no hash verification, no real workflow resolution, no `status`, no `artefact new` — all out of scope for this story (see contract).
- Architecture guardrails: read `.github/architecture-guardrails.md`; land the new "no-writes-outside-sidecar" guardrail entry in this same PR per ARCH decision.
- Open a draft PR when tests pass — do not mark ready for review.
- If you encounter an ambiguity not covered by the ACs or tests: add a PR comment and do not mark ready for review.

Oversight level: Medium
```

---

## Sign-off

**Oversight level:** Medium
**Sign-off required:** No — operator shares DoR artefact with themselves-as-tech-lead (solo delivery)
**Signed off by:** Operator, 2026-04-15

---

## Outcome

✅ **READY TO PROCEED** — assign to coding agent via the instructions block above.
