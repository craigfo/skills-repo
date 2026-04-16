# Review Report: ec3.1 Relocate pipeline-state to per-artefact; root becomes derived — Run 1

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec3.1-pipeline-state-isolation.md`
**Date:** 2026-04-16
**Categories run:** A, B, C, D, E
**Outcome:** PASS WITH CONDITIONS — 1 MEDIUM to resolve before `/test-plan`.

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (B — Scope / load-bearing assumption) — The story's Out-of-Scope section states: *"Slug-detection logic for 'current feature slug.' Assume each skill already knows or can derive the active feature slug from the branch / working directory context; if it doesn't, that's a pre-existing gap, separate."*

  This is load-bearing. If any skill currently invoked during an ec1.x migration or ec2.x governance flow does NOT reliably derive its active feature-slug, AC1 and AC6 become un-enforceable — the skill writes to an indeterminate path, or to no path at all, silently. "Pre-existing gap, separate" defers a question the story depends on for correctness.

  **Risk if not resolved:** ec3.1 ships, the grep-check passes (no skill writes to `.github/pipeline-state.json` anymore), but some skill is silently writing to `artefacts/undefined/pipeline-state.json` or erroring and not writing at all. MM4(a) structural check passes; MM4(b) operational is clean because writes are disappearing, not conflicting.

  **Fix options:**
  - (a) Inline a precondition AC: *"AC0 — a one-line audit confirms every skill that invokes the pipeline-state write helper either already derives the feature-slug from its invocation context or is patched to do so within ec3.1's scope."* Makes the assumption testable.
  - (b) Spin a tiny upstream spike story (ec3.0) — *"audit skills for slug-detection readiness"* — that gates ec3.1.
  - (c) Accept via `/decisions` as RISK-ACCEPT with a named operator check at first post-ship pipeline run.

  Recommendation: (a). Cheapest, scope-consistent, keeps ec3.1 self-contained.

## LOW findings — note for retrospective

- **1-L1** (C — AC quality) — AC1's allowed-residual clause reads: *"any remaining matches are in read-only scanner / archival-reference paths and explicitly commented."* "Explicitly commented" is qualitative. Tightening at `/test-plan`: enumerate the permitted residual paths directly (the scanner source file, and the AC5 pointer-doc path if that variant landed). Reviewer then checks an explicit allow-list, not a prose qualifier.
- **1-L2** (C — AC quality) — AC3's verification reads: *"file open / fetch path change is a one-line edit; viz renders identically for a test artefact-folder set."* The first half checks the change set (diff-size), the second checks functional equivalence. The diff-size check is fragile (a formatting-only adjacent edit would fail a line-count assertion). Drop the "one-line edit" phrasing; keep the functional identity check as the real AC.
- **1-L3** (C — AC quality) — AC5 mandates exactly one of two outcomes (delete-with-git-history OR pointer-doc). Unclear which is preferred. Suggest at `/test-plan`: the pointer-doc variant is strongly preferred because it preserves discoverability for anyone still navigating to the old path. Delete-only is acceptable only if an explicit redirect is placed in `docs/ONBOARDING.md` or similar. Picking now avoids reviewer coin-flip at implementation.
- **1-L4** (D — Completeness, borderline) — NFR on scanner runtime is "<1 second on a dev laptop over ≤10 features." No guidance on behaviour beyond 10 features, and no statement on what happens if a malformed per-artefact file is encountered (skip-with-warning? halt?). Suggest at `/test-plan`: add a one-line AC for malformed-input handling — fail loud, not silent.
- **1-L5** (E — Testability at scale) — The operational half of MM4 (b) needs a 30-day post-ship window to validate. That window is outside this story's DoD. Implicit assumption: if MM4(a) passes at DoD, MM4(b) is expected to be a no-op — but if MM4(b) does light up, there's no stated feedback loop from *that future event* back into this feature's closure. The feedback loop IS named on the benefit-metric sheet (MM4 feedback-loop field), which is the right place. This is more a cross-reference note than a finding — mark as Low for the retro, no action required.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS — references decisions Q5, epic-3, discovery, benefit-metric, schema file |
| Scope integrity | 4 | PASS — out-of-scope list is explicit and defensible; the one MEDIUM is a scope deferral that may need to fold back in |
| AC quality | 4 | PASS — 7 ACs mostly falsifiable; M1 is about a structural dependency rather than phrasing |
| Completeness | 5 | PASS — dependencies, NFRs, DoR checklist all present |

## Summary

0 HIGH, 1 MEDIUM, 5 LOW.
**Outcome:** PASS WITH CONDITIONS — M1 (slug-detection audit) should be resolved via a new AC0 (preferred), a pre-gate spike story, or a RISK-ACCEPT `/decisions` entry before `/test-plan`. LOWs carry to `/test-plan` for phrasing tightening.
