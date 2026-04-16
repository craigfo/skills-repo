# Cross-Story Impact Note: ec3.1's introduction on the ec1.x migration batch

**Date:** 2026-04-16
**Trigger:** decisions Q5 added ec3.1 (pipeline-state isolation) after ec1.1–ec1.7 had already passed `/review`.
**Purpose:** Check whether any ec1.x story's ACs, out-of-scope list, dependencies, or DoD evidence depend on assumptions that ec3.1 invalidates.

---

## Summary

**No content change required to any ec1.x story.** The story files (ec1.1 through ec1.7) do not reference `.github/pipeline-state.json`, the root aggregate, or any specific pipeline-state write path. Their ACs are scope-local to subcomponent file relocation, test co-location, import fixups, and grep invariants on `src/<subcomponent>/` references.

The fact that running an ec1.x story *invokes skills that write pipeline state* is transparent to the story content — no AC or out-of-scope clause names the state-write destination.

**Re-review outcome for ec1.1 – ec1.7:** unchanged from run 1 (all PASS, findings carry).

---

## Ship-order implications

The two stories touch overlapping ground only at pipeline-state-write time. Three possible orderings and their consequences:

| Order | What happens | Required action |
|-------|--------------|-----------------|
| **A) ec3.1 ships first, then ec1.x** | Each ec1.x migration's skill invocations write pipeline state to `artefacts/2026-04-16-engine-consolidation/pipeline-state.json` (this feature's own file) from day one. | None. Works by construction. |
| **B) ec1.x migrations ship first, then ec3.1** | ec1.x runs write to the root file as today. When ec3.1 ships, the scanner's first aggregate run must fold the existing root state into the derived view. | ec3.1 AC2 already names this: scanner diff must match root content field-for-field on features present in both. Cut-over is covered. |
| **C) Interleaved — some ec1.x merge, then ec3.1 merges, then more ec1.x merge** | Pre-ec3.1 merges wrote root state; post-ec3.1 merges write per-artefact. The engine-consolidation feature folder's `pipeline-state.json` captures only the post-ec3.1 subset. | ec3.1's cut-over scanner run (a one-shot) should copy engine-consolidation's pre-cut-over entries from the old root file into the new per-artefact file. Not currently named in ec3.1 ACs. |

**Finding:** Order C has a gap. ec3.1 AC2 says the scanner's output matches the existing root content (good for VIEWS post-ship), but nothing in ec3.1 says: *"on cut-over, pre-existing in-flight feature state is migrated from root to per-artefact."* If an ec1.x migration is half-done at cut-over, its accumulated state lives in root-only.

**Severity:** Low (if interleaving is avoided), Medium (if interleaving is likely).

**Fix options for ec3.1:**
- (1) Add an **AC8 (cut-over migration)** to ec3.1: *"At first scanner run post-relocation, any feature present in the old root file that does not yet have an `artefacts/<slug>/pipeline-state.json` has one created as a copy of its entry from the root file. This is a one-shot migration step, commented as such in the scanner source."*
- (2) Declare interleaving out-of-scope: the operator ships ec3.1 either before any ec1.x merges or after all of them. Adds a scheduling constraint but no code.
- (3) Accept via `/decisions` that in-flight feature state at cut-over may need a manual one-shot copy — documented in the ec3.1 PR description.

**Recommendation:** (1) — the scanner already walks the tree; adding an idempotent "seed missing per-artefact file from root" step is small and self-contained.

---

## Recommended sequencing — opinion, not binding

If the operator cares about MM4(b)'s 30-day clean window starting as early as possible, ship ec3.1 **first** (Order A). This means the ec1.x batch runs on the new per-artefact model from the start, generating MM4 evidence from day zero. Order A also avoids the interleaving gap entirely.

If throughput on the migrations matters more and the contention risk is tolerated for a few more days, ship ec1.x batch first (Order B). Cut-over is covered by the existing AC2.

Order C is the default if no sequencing discipline is imposed — avoid unless the gap is fixed via fix option (1).

---

## Carry-forward

- **To `/test-plan`:** the decision on fix options (1) / (2) / (3) for the Order-C gap. If (1), a new AC8 is added to ec3.1 and `/test-plan` designs its test.
- **To `/implementation-plan`:** sequencing discipline (A / B / C) should be an explicit decision, not an accident of which branch finishes first.
- **To benefit-metric:** no change. MM4's measurement window definition is robust to any of the three orderings because (a) and (b) both measure post-ec3.1-ship behaviour.

---

**Reviewer:** same stance as outer-loop review. No ec1.x content edits issued; one new MEDIUM-candidate issue surfaced against ec3.1 that wasn't visible when ec3.1 was reviewed in isolation (ec3.1 review-1 1-M1 addresses slug-detection; this note adds a separate gap on cut-over migration).
