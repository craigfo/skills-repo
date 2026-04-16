# Decision Log: 2026-04-16-engine-consolidation

**Feature:** Engine consolidation (CLI as control plane)
**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Last updated:** 2026-04-17

---

## Decision categories

| Code | Meaning |
|------|---------|
| `SCOPE` | MVP scope added, removed, or deferred |
| `SLICE` | Decomposition and sequencing choices |
| `ARCH` | Architecture or significant technical design (full ADR if complex) |
| `DESIGN` | UX, product, or lightweight technical design choices |
| `ASSUMPTION` | Assumption validated, invalidated, or overridden |
| `RISK-ACCEPT` | Known gap or finding accepted rather than resolved |

---

## Log entries

---
**2026-04-16 | SCOPE | clarify (Q1 — migration approach)**
**Decision:** All seven `src/*` subcomponents migrate in parallel — each on its own branch, opened concurrently — not sequentially.
**Alternatives considered:** (A) smallest / lowest-risk first (approval-channel), (B) highest-Phase-3-collision-risk first (surface-adapter), (C) most thesis-loaded first (improvement-agent), (D) parallel (chosen), (E) other.
**Rationale:** At solo scale, throughput beats sequential learning. Subcomponents are structurally independent enough that cross-branch collisions are rare. Sequential order was recommended by Claude; operator overrode on throughput grounds.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** If one subcomponent's move exposes a pattern-level flaw (e.g. implicit coupling or path assumption) that all parallel branches inherit before detection, sequence the remainder.

---
**2026-04-16 | ASSUMPTION | clarify (Q2 — pre/post test invariant)**
**Decision:** Record assumption A.2 (refined): **pre-migration test count + pass rate on each subcomponent's existing test file(s) must exactly match the post-migration figures.** Any drift is a test failure that blocks the move's PR. This is the operational definition of "move-only — no behaviour change."
**Alternatives considered:** Trust visual code review; rely on broader `npm test` success across the suite.
**Rationale:** Count + pass-rate is a falsifiable, mechanical invariant. Visual review misses implicit-coupling regressions. Broader `npm test` success doesn't isolate which subcomponent drifted. Per-subcomponent, pre/post snapshot is the minimum credible evidence of move-only safety.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** If a move ever legitimately changes test counts (e.g. test-framework migration discovered mid-move), re-scope that subcomponent's story; do not relax the invariant silently.

---
**2026-04-16 | SCOPE | clarify (Q3 — `.github/scripts/` collapse deferred)**
**Decision:** The broader `.github/scripts/` collapse — per-script classification (CLI-logic duplicator vs hygiene validator) and replacement of duplicators with `skills-repo verify` / `skills-repo improve` invocations — is **deferred to a separate future feature** (`2026-04-NN-github-scripts-collapse`, TBD). This feature retains only the two subcomponent tests (`check-surface-adapter.js`, `check-suite.js`) that move with their source per Q2.
**Alternatives considered:** (1) include the collapse in this feature's MVP with evidence-based classification done up front (~30 min of script reading); (2) include it with a `/spike` story for investigation; (3) defer to a follow-up (chosen).
**Rationale:** Operator is not intricately familiar with each of the 14 remaining scripts' knock-on effects. Classifying without understanding risks breaking CI workflows (a script deleted that was actually hygiene-critical). The collapse also naturally ties to 005 Gate 4 (real CI assurance gate), which is when most duplicator replacements become meaningful. Splitting keeps this feature's scope mechanical (move-only) while the judgment-heavy collapse gets its own discovery.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** If any of the 14 deferred scripts actively duplicates logic the CLI is about to introduce under this feature's subcomponent moves, fold it into the relevant subcomponent story rather than leaving it for the follow-up.

---
**2026-04-16 | SCOPE | clarify (Q4 — definition-skill destination)**
**Decision:** `src/definition-skill/helpers.js` migrates to `cli/src/engine/story/` (or a similarly-named engine-level module), NOT `cli/src/agents/definition-skill/`. It's a pure-ish story-format validator utility consumed by multiple skills (definition, review, test-plan, DoR), not a definition-skill-specific agent.
**Alternatives considered:** (A) `cli/src/agents/definition-skill/` — skill-scoped placement; (B) drop from this feature — defer to 005 Gate 3 (LLM bridge); (C) `cli/src/engine/story/` — engine-level utility (chosen).
**Rationale:** The 6 exported functions (extractUpstreamSlugs, isExternallyAcknowledged, validateExternalAnnotation, resolveSlug, checkTestability, hasTestabilityAnnotation) all operate on story artefacts generically. Scoping to one agent (A) under-claims the reach; dropping (B) leaves story-format enforcement instructional rather than structural — violates the control-plane principle this feature exists to enforce.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** If the LLM-bridge work (005 Gate 3) introduces a different "skill helpers" convention that would house these more naturally, relocate then.

---
**2026-04-16 | ASSUMPTION | clarify (Q3 follow-on — safe to defer `.github/scripts/` collapse)**
**Decision:** Record new assumption A.4: deferring the broader `.github/scripts/` collapse is safe because **no src/ migration in this feature deletes or relocates a hygiene-only validator**; subcomponent tests that move (item 2 in MVP scope) are explicitly not hygiene scripts; all other hygiene validators stay untouched.
**Alternatives considered:** No corresponding deferral — do the classification in this feature after all.
**Rationale:** The claim is falsifiable: check after each subcomponent migration that `git status` outside `cli/src/<subcomponent>/` and `cli/tests/<subcomponent>/` doesn't touch `.github/scripts/` except for the two named moves. If an unplanned `.github/scripts/` change appears mid-migration, the assumption is invalidated and the deferral re-scoped.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** First migration that needs to touch an additional `.github/scripts/` file beyond the two in Q2.

---
**2026-04-16 | ARCH | scope-add (Q5 — pipeline-state isolation for N contributors)**
**Decision:** Pipeline state relocates from a single root `.github/pipeline-state.json` to **per-artefact** `artefacts/<slug>/pipeline-state.json`. The root file becomes a **derived aggregate** — rebuilt by a scanner walking the artefact folders — not an authoritative write target. When a feature reaches DoD sign-off, the artefact's `pipeline-state.json` is marked `featureStatus: complete` and **retained with the folder** (NOT deleted). Audit history is preserved per-feature; the cross-feature view is always derivable.
**Alternatives considered:** (A) keep root file + document a write-coordination protocol in CONTRIBUTING.md; (B) per-artefact write, delete on feature completion; (C) per-artefact write, mark complete on feature finish — file retained (**chosen**); (D) defer entirely to a future feature with its own discovery.
**Rationale:** (A) punts the conflict to contributor discipline — every concurrent phase-boundary write still races on a 38K-token file. (B) solves the conflict but kills the audit record that `docs/concepts/primitives/pipeline-state.md` names as a primary value prop ("committed, versioned, readable by any agent or any team member at any point"). (C) solves the conflict AND preserves history — deletion downgrades to a status marker; the root aggregate still drives `pipeline-viz.html` via a scan. (D) defers too long — this feature already has two concurrent contributors (productisation + Phase 3) racing on the root file; the risk is present now, not theoretical.
**Scope impact:** Adds a new epic (**epic-3 — pipeline-state isolation**) to this feature. One story (`ec3.1`). Feature-level complexity rerated from 2 → 3 to reflect the fan-out across every skill that writes state. Benefit-metric document may need a reconciliation pass (new metric: root file write-contention eliminated) — flagged as follow-up, not done here.
**Made by:** operator.
**Revisit trigger:** If the scanner approach proves expensive on a grown artefacts/ tree (e.g., visualisation rebuild > few seconds), or if a per-artefact state file needs a schema change within the first two uses, revisit the split and/or add caching.

---
**2026-04-17 | SCOPE | review-response (ec3.1 review-1 M1 — slug-detection deferral folded back into scope)**
**Decision:** Resolve ec3.1 review-1 M1 via option (a) — inline a new AC0 into the story making the slug-detection audit an in-scope, testable precondition rather than an out-of-scope deferral. AC0 requires every pipeline-state writer to either already derive the active feature-slug from context or be patched within ec3.1 to do so, with the audit recorded as a one-table section of the implementation plan. The Out-of-Scope entry is rewritten: net-new slug-detection infrastructure stays out of scope; localised patches are in.
**Alternatives considered:** (a) inline AC0 (chosen — reviewer's pick); (b) spin a pre-gate spike story ec3.0; (c) RISK-ACCEPT via /decisions with a named operator check at first post-ship pipeline run.
**Rationale:** (a) is the cheapest option that keeps ec3.1 self-contained, keeps AC1 and AC6 enforceable without a silent "writes-to-undefined-slug" failure mode, and avoids fanning out another story or deferring the question into operational risk. (b) doubles the story count for what is likely a short audit; (c) accepts operational risk on a metric (MM4(b)) that already needs a 30-day observation window, compounding the uncertainty.
**Made by:** operator (pickup /review → /test-plan transition, 2026-04-17).
**Revisit trigger:** If the AC0 audit surfaces ≥3 skills needing net-new slug-detection infrastructure (not a localised patch), split ec3.0 after all and gate ec3.1 on it.
