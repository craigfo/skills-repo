# Definition of Ready Checklist

## Definition of Ready: Apply product/* edits (roadmap + tech-stack + decisions ADR)

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.2-product-edits.md`
**Test plan reference:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec2.2-product-edits-test-plan.md`
**Verification script reference:** `artefacts/2026-04-16-engine-consolidation/verification-scripts/ec2.2-product-edits-verification.md`
**Review reference:** `artefacts/2026-04-16-engine-consolidation/review/ec2.2-product-edits-review-1.md` — PASS, 0 HIGH / 0 MEDIUM / 2 LOW.
**Contract proposal:** `artefacts/2026-04-16-engine-consolidation/dor/ec2.2-product-edits-dor-contract.md`
**Assessed by:** Copilot (Claude Opus 4.6)
**Date:** 2026-04-17

---

## Contract Review

✅ **Contract review passed** — proposed implementation aligns with all 3 ACs. AC1 tightness (review L1) is resolved at the test-plan layer by 3 block-presence unit checks, not by reopening the story.

---

## Hard Blocks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| H1 | User story in As / Want / So with named persona | ✅ | Persona: productisation-thread contributor. |
| H2 | ≥ 3 ACs in Given / When / Then | ✅ | 3 ACs; AC1 effectively 3-in-1 (roadmap, tech-stack, ADR), but test plan splits unit coverage across the three blocks. |
| H3 | Every AC has a test | ✅ | 3 unit checks for AC1 (one per block) + 1 unit for AC3 + 2 manual (AC1 reviewer + AC2 commit message) — see test plan coverage table. |
| H4 | Out-of-scope populated | ✅ | 3 explicit out-of-scope items (mission/constraints, standards, future roadmap entries). |
| H5 | Benefit linkage references a named metric | ✅ | M3 referenced. |
| H6 | Complexity rated | ✅ | Rating: 1, Scope stability: Stable. |
| H7 | No unresolved HIGH findings | ✅ | Review-1 PASS, 0 HIGH / 0 MEDIUM / 2 LOW. L1 (AC1 tightness) handled at /test-plan by splitting into 3 unit checks. |
| H8 | No uncovered ACs in test plan | ✅ | All 3 ACs covered. |
| H8-ext | Schema dependency check | ✅ | Upstream: None — schema check not required. |
| H9 | Architecture Constraints populated; no Category E HIGH | ✅ | "None identified — documentation only." Explicit declaration satisfies the requirement. |
| H-E2E | No CSS-layout-dependent ACs | ✅ | Documentation story. |
| H-NFR | NFR profile exists OR story explicit 'None' | ✅ | Story: "None identified — documentation only." |
| H-NFR2 | Compliance NFR with regulatory clause signed off | ✅ | None declared. |
| H-NFR3 | Data classification not blank | ✅ | Feature-wide: Public. |
| H-NFR-profile | NFR profile presence matches story NFR section | ✅ | Story NFRs "None" — profile presence check skipped. |

**Result:** 15 / 15 passed.

---

## Warnings

| # | Check | Status | Notes / Acknowledgement |
|---|-------|--------|-------------------------|
| W1 | NFRs identified or 'None — confirmed' | ✅ | Performance, Security, Accessibility (N/A), Audit all addressed. |
| W2 | Scope stability declared | ✅ | Stable. |
| W3 | MEDIUM review findings acknowledged in /decisions | ✅ | No MEDIUMs in review. |
| W4 | Verification script reviewed by domain expert | ⚠️ ack | Solo project: operator is the domain expert. Self-review will occur at PR time before merge. Logged as RISK-ACCEPT via /decisions review-response entry (2026-04-17 DoR run) — named operator check at PR. |
| W5 | No UNCERTAIN items in test-plan gap table | ✅ | Gap table entries have explicit reasons and mitigations; none marked UNCERTAIN. |

**W4 acknowledgement:** Solo-operator — self-review at PR time. RISK-ACCEPT logged via /decisions on 2026-04-17.

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: Apply product/* edits — artefacts/2026-04-16-engine-consolidation/stories/ec2.2-product-edits.md
Test plan: artefacts/2026-04-16-engine-consolidation/test-plans/ec2.2-product-edits-test-plan.md
Verification script: artefacts/2026-04-16-engine-consolidation/verification-scripts/ec2.2-product-edits-verification.md

Goal:
Land three documentation edits — roadmap append, tech-stack amend,
decisions.md ADR — matching the text blocks in artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md ("Proposed product/* edits" section).

Expected touchpoints:
- product/roadmap.md — append a "Productisation thread (started 2026-04-15)" section
- product/tech-stack.md — amend "Repository structure" with an "Engine layout (post-consolidation target)" subsection + tree diagram
- product/decisions.md — append ADR-XX "CLI is the single authoritative control plane" (X = next available ADR number in decisions.md)
- tests/check-product-edits.js — new validator (4 unit assertions per test plan)

Out of scope:
- product/mission.md, product/constraints.md (protected by C4 / C13)
- Any standards/ or SKILL.md changes
- Future roadmap entries beyond the Productisation-thread paragraph

Constraints:
- ADR number is operator-assigned at landing time — check decisions.md for the
  next available N and use ADR-N (not ADR-00X placeholder)
- Commit message must list each file with a one-line summary (AC2)
- Prose may be reworded — it must *say* what 006 says, not be identical text
- Open a draft PR when the validator passes — do not mark ready for review

Oversight level: Low — no sign-off required. Proceed directly to coding agent.
```

---

## Sign-off

**Oversight level:** Low
**Sign-off required:** No
**Acknowledged by:** Operator, 2026-04-17
