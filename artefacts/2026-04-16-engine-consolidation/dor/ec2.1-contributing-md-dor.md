# Definition of Ready Checklist

## Definition of Ready: Add CONTRIBUTING.md at repo root

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Test plan reference:** `artefacts/2026-04-16-engine-consolidation/test-plans/ec2.1-contributing-md-test-plan.md`
**Verification script reference:** `artefacts/2026-04-16-engine-consolidation/verification-scripts/ec2.1-contributing-md-verification.md`
**Review references:**
- `artefacts/2026-04-16-engine-consolidation/review/ec2.1-contributing-md-review-1.md` — 1 MEDIUM (resolved in-story)
- `artefacts/2026-04-16-engine-consolidation/review/ec2.1-contributing-md-review-2.md` — PASS, 0 HIGH / 0 MEDIUM / 3 LOW.
**Contract proposal:** `artefacts/2026-04-16-engine-consolidation/dor/ec2.1-contributing-md-dor-contract.md`
**Assessed by:** Copilot (Claude Opus 4.6)
**Date:** 2026-04-17

---

## Contract Review

✅ **Contract review passed** — proposed implementation aligns with all 4 ACs (AC1, AC1a, AC2, AC3). See `ec2.1-contributing-md-dor-contract.md`.

Note on AC1a: the contract includes an explicit `sequencingDepends: ec3.1` declaration so the reviewer can check ec3.1 status at PR time before merging subsection 7.

---

## Hard Blocks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| H1 | User story in As / Want / So with named persona | ✅ | Persona: productisation-thread contributor. |
| H2 | ≥ 3 ACs in Given / When / Then | ✅ | 6 ACs, all G/W/T. |
| H3 | Every AC has a test | ✅ | 4 ACs → 4 unit + 3 manual scenarios (see test plan coverage table; AC1a and AC2 handled via verification script). |
| H4 | Out-of-scope populated | ✅ | 3 explicit out-of-scope items (CODEOWNERS activation, multi-contributor scale, README/QUICKSTART changes). |
| H5 | Benefit linkage references a named metric | ✅ | M3 referenced. |
| H6 | Complexity rated | ✅ | Rating: 1, Scope stability: Stable. |
| H7 | No unresolved HIGH findings | ✅ | Two review runs: run-1 had 1 MEDIUM (resolved in-story during run-2); run-2 0 HIGH / 0 MEDIUM / 3 LOW. |
| H8 | No uncovered ACs in test plan | ✅ | All 4 ACs covered; AC1a and AC2 gaps documented (reviewer-gated, convention-gated). |
| H8-ext | Schema dependency check | ✅ | Upstream: None — schema check not required. (AC1a references ec3.1 as a downstream coordination gate, not a dependency on existing schema.) |
| H9 | Architecture Constraints populated; no Category E HIGH | ✅ | "None identified — documentation only." Explicit declaration satisfies the populated-ness requirement. |
| H-E2E | No CSS-layout-dependent ACs | ✅ | Documentation story. |
| H-NFR | NFR profile exists OR story explicit 'None' | ✅ | Story declares "None identified — documentation only." |
| H-NFR2 | Compliance NFR with regulatory clause signed off | ✅ | None declared. |
| H-NFR3 | Data classification not blank | ✅ | Feature-wide: Public. |
| H-NFR-profile | NFR profile presence matches story NFR section | ✅ | Story NFRs "None" — profile presence check skipped per skill rules. |

**Result:** 15 / 15 passed.

---

## Warnings

| # | Check | Status | Notes / Acknowledgement |
|---|-------|--------|-------------------------|
| W1 | NFRs identified or 'None — confirmed' | ✅ | Performance, Security, Accessibility (N/A), Audit all addressed. |
| W2 | Scope stability declared | ✅ | Stable. |
| W3 | MEDIUM review findings acknowledged in /decisions | ✅ | Review-1 MEDIUM resolved in-story during review-2; no outstanding MEDIUMs to /decisions-log. |
| W4 | Verification script reviewed by domain expert | ⚠️ ack | Solo project: operator is the domain expert. Self-review will occur at PR time before merge. Logged as RISK-ACCEPT via /decisions review-response entry (2026-04-17 DoR run) — named operator check at PR. |
| W5 | No UNCERTAIN items in test-plan gap table | ✅ | Gap table entries have explicit reasons and mitigations; none marked UNCERTAIN. |

**W4 acknowledgement:** Solo-operator — self-review at PR time. RISK-ACCEPT logged via /decisions on 2026-04-17.

---

## Coding Agent Instructions

```
## Coding Agent Instructions

Proceed: Yes
Story: Add CONTRIBUTING.md at repo root — artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md
Test plan: artefacts/2026-04-16-engine-consolidation/test-plans/ec2.1-contributing-md-test-plan.md
Verification script: artefacts/2026-04-16-engine-consolidation/verification-scripts/ec2.1-contributing-md-verification.md

Goal:
Create CONTRIBUTING.md at the repo root with the 7 required subsections
described in AC1 (scope ownership, product/* proposals, standards/ proposals,
code changes, branching, WIP signalling, pipeline-state coordination).

Sequencing constraint (AC1a):
Subsection 7 (pipeline-state coordination) MUST NOT be merged until ec3.1 is
in-flight on develop or already shipped. At implementation time:
- Check pipeline-state for ec3.1's stage.
- If ec3.1 is at stage ≤ 'review' — do NOT include subsection 7 in this PR;
  land it as a follow-up PR once ec3.1 ships.
- If ec3.1 is at stage 'test-plan' or later — subsection 7 may be included if
  the CONTRIBUTING prose frames the behaviour as intended-and-in-flight.
- If ec3.1 is shipped on develop — subsection 7 is included unconditionally.

Expected touchpoints:
- CONTRIBUTING.md (repo root) — new file, ≤ 300 lines
- tests/check-contributing-md.js — new validator (4 unit assertions per test plan)

Out of scope:
- CODEOWNERS activation
- Multi-contributor governance
- README.md or QUICKSTART.md changes
- Any SKILL.md or standards/ edits

Constraints:
- Commit message must list each file with a one-line summary (AC2)
- Scope-ownership subsection must enumerate the 5 scope rows (≥ 5 of 11 scope
  tokens per the test plan keyword-presence check)
- Pipeline-state subsection must include 'per-artefact', 'featureStatus',
  'scanner' as phrases (conceptual signals)
- Open a draft PR when the validator passes — do not mark ready for review
- If you encounter ambiguity: add a PR comment and do not mark ready for review

Oversight level: Low — no sign-off required. Proceed directly to coding agent.
```

---

## Sign-off

**Oversight level:** Low
**Sign-off required:** No
**Acknowledged by:** Operator, 2026-04-17
