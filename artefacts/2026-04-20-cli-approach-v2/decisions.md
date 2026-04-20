# Decision Log: 2026-04-20-cli-approach-v2

<!--
  PURPOSE: Records the reasoning behind human judgment calls made during the pipeline.

  Artefacts record WHAT was decided.
  This log records WHY, by WHOM, and what was considered and rejected.

  This is the document you read six months later when someone asks:
  "Why did we do it this way?" or "Who agreed to skip that?"

  Written to by: pipeline skills (at decision points) and humans (during implementation).
  Read by: retrospectives, audits, onboarding, future work on this feature.

  To evolve this format: update templates/decision-log.md and open a PR.
-->

**Feature:** CLI approach for AI-assisted workflow (v2)
**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md`
**Supersedes:** `../2026-04-18-cli-approach/decisions.md` — feature-level ADR-001 ("CLI as reference implementation for Spike B2") is retired by this v2 re-run; see entry below. Feature-level ADR-002 (workflow-as-graph) and ADR-003 (verification contract per-node) are preserved in content via Phase 4 outputs (`theme-f-inputs.md §2`, `src/enforcement/cli-adapter.js`) and not re-asserted here — per the numbering-collision follow-up in discovery.md.
**Last updated:** 2026-04-20

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
**2026-04-20 | SCOPE | discovery (/clarify Q1)**
**Decision:** MVP covers the full workflow graph — every outer-loop skill plus the inner-loop coding sub-steps and the composed support skills — not a single-phase demonstrator. The workflow declaration has nodes for /discovery, /benefit-metric, /definition, /review, /test-plan, /definition-of-ready, /decisions, /branch-setup, /implementation-plan, /subagent-execution, /verify-completion, /branch-complete, /definition-of-done, /trace, plus /workflow, /clarify, /estimate, /checkpoint, /tdd, /systematic-debugging, /implementation-review.
**Alternatives considered:** (A) one-phase demonstrator — declare the workflow for /discovery alone (or /benefit-metric alone, or /test-plan alone) to prove the seam end-to-end for one step. Minimum authoring burden; cheapest path to "the architecture works." (B) partial graph — outer loop only, inner-loop coding sub-steps deferred. Half-measure; cuts off the coding work the operator actually spends time on. (C) full graph (chosen) — every node the operator reaches for during a feature lifecycle.
**Rationale:** For the CLI to be worth adopting, the operator has to be able to *use* it across the full feature lifecycle, not just run it against a single step to prove the seam. Single-step demonstrators prove technical architecture but are theatre — they cannot be adopted. Usability-first framing trumps proof-of-concept framing when the operator is the primary consumer. Authoring the full declaration is substantial work — acknowledged in discovery MVP Scope as the largest tranche of authoring in the feature, not an afterthought.
**Made by:** Operator (craigfo), 2026-04-20, during /clarify Q1 on the v2 re-run.
**Revisit trigger:** If authoring burden exceeds platform-team capacity (Risk 7 in discovery — finite bandwidth, second maintenance surface), trim the graph to a phased rollout — outer loop first, inner-loop coding sub-steps later. If a specific skill is persistently drifty to author in declaration form, reshape the declaration schema before cutting scope. If /definition discovers a skill where declaration cost clearly outweighs benefit, that specific node may be carried as instructional with a logged exception.

---
**2026-04-20 | ARCH | discovery (/clarify Q2)**
**Decision:** Ownership is split between Phase 4 `p4-enf-cli` and this cli-approach-v2 feature. `p4-enf-cli` (DoR'd 2026-04-19 under Phase 4 E3) owns the CLI adapter code — fleshing the 7 stubs in `src/enforcement/cli-adapter.js`, hardening the 2 real commands (`advance`, `emitTrace`), wiring into `governance-package.js`, and satisfying its 4 ACs. This feature owns everything else needed for operator end-to-end usability: the full workflow-graph declaration, operator-facing documentation, the first-run integration guide, any `init` UX work beyond stub replacement, and the customisation / upgrade / sidecar-collision behaviours not covered by p4-enf-cli's ACs. Stories in parallel; dependency declared where an AC transitively needs adapter code in place.
**Alternatives considered:** (A) split ownership (chosen) — clean boundary: adapter mechanics live in p4-enf-cli, end-to-end usability lives here. (B) umbrella — this feature subsumes p4-enf-cli entirely; adapter code becomes one of this feature's stories. Would require reopening/closing p4-enf-cli and reassigning its ACs; throws away the DoR work. (C) supersede — this feature re-decomposes freshly; p4-enf-cli is closed/merged. Same objection as B plus larger churn on already-DoR'd work.
**Rationale:** p4-enf-cli is already DoR'd with bounded, well-scoped adapter-mechanic ACs (9 commands implemented, transitions enforced, hash verify enforced, trace gate-accepted). Subsuming or superseding discards that work without adding value — the ACs stay the same whatever feature owns them. Split is the minimal-friction option that respects already-landed work while making room for the larger end-to-end usability scope this v2 feature covers. The boundary is clean because the concerns don't overlap: p4-enf-cli is about *code mechanics*, this feature is about *what the operator needs to actually use the tool*.
**Made by:** Operator (craigfo), 2026-04-20, during /clarify Q2 on the v2 re-run.
**Revisit trigger:** If p4-enf-cli's ACs evolve to absorb workflow-graph authoring or operator docs (unlikely — scope misfit), the split becomes redundant; reconsider consolidation. If /definition discovers significant AC overlap with p4-enf-cli's stories during decomposition, reopen the split vs. subsume question. If heymishy (p4-enf-cli owner) and the operator diverge on adapter-code direction, the split may need to be formalised with a clearer interface contract between the two features.

---
**2026-04-20 | DESIGN | discovery (/clarify Q3)**
**Decision:** MVP validation target is operator self-consumption across two existing (unnamed) projects. Both real repos with live work; not synthetic test scaffolds; not fresh empty repos. The operator installs the CLI from npm into each project, sidecar materialises upstream content, and at least one full feature cycle is completed end-to-end through each. Second-party consumers are explicitly out-of-scope for MVP validation.
**Alternatives considered:** (A) operator self-test repo — fresh synthetic repo created for testing; fast feedback but doesn't exercise non-fork mechanism against realistic structure. (B) second-party consumer — external team member (e.g. Thomas, Craig's work squad) completes MVP flow; adds comprehension validation but slows MVP and risks blocking on external availability. (C) both — A first, then B; longest path. (D) two existing projects (chosen) — operator self-drives but across two *real* repos with *live work*, so cross-project quirks surface and the non-fork mechanism gets exercised against realistic structure. Variant of A that trades synthetic-scaffold speed for realism.
**Rationale:** Two projects over one: single-project validation risks mistaking setup-artefact quirks for normal behaviour; two projects surface cross-project issues (repo structure, existing .gitignore, collisions with operator-authored ADRs, etc.) Existing over synthetic: the non-fork mechanism's real test is against repo structure the operator didn't design for the CLI — synthetic scaffolds are too cooperative. Operator self over second-party: keeps the feedback loop fast, avoids blocking on external availability; comprehension validation (second pair of eyes) can follow post-MVP if needed.
**Made by:** Operator (craigfo), 2026-04-20, during /clarify Q3 on the v2 re-run.
**Revisit trigger:** If operator self-consumption completes cleanly but stakeholders demand external validation as a gate before /definition-of-done, enrol a second-party consumer before declaring MVP done. If self-testing reveals consistent blind-spots (operator missing issues a fresh consumer would catch), promote second-party validation into MVP rather than deferring. If either of the two existing projects hits a blocker that requires third-party workaround expertise, expand the validation cohort.

---
**2026-04-20 | SCOPE | discovery (/clarify Q1 consequence)**
**Decision:** Feature-level ADR-001 in `../2026-04-18-cli-approach/decisions.md` ("CLI as reference implementation for Spike B2, not universal governance package") is **retired**. The (a)/(b) framing it preserved is superseded by repo-level ADR-phase4-enforcement (Mechanism selection: CLI for regulated / CI surface class) and ADR-013 (shared 3-operation governance package). This v2 feature does not replicate the retired ADR; the 2026-04-18 folder is preserved unchanged on master for historical reference.
**Alternatives considered:** (A) replicate and update ADR-001 in v2's decisions.md — keep the continuity but tag it superseded. Perpetuates the feature-level ADR numbering collision (ADR-001/002/003 vs. repo-level ADR-001/002/003). (B) mark ADR-001 superseded in the original 2026-04-18 file — requires modifying master-canonical content. (C) retire and do not replicate (chosen) — document the retirement in this log; let the repo-level ADR-phase4-enforcement carry the mechanism-selection authority.
**Rationale:** The feature-level ADR numbering collides with the repo-level register per `copilot-instructions.md §Architecture standards` (repo-level register at `.github/architecture-guardrails.md` is authoritative). Keeping ADR-001 would replicate the collision without adding information — ADR-phase4-enforcement already documents the mechanism-selection decision. Retire-and-document-in-log is the simplest clean-up; no master-canonical content is disturbed.
**Made by:** Operator (craigfo), 2026-04-20, as a consequence of /clarify Q2 and the discovery Follow-up item on feature-level ADR cleanup.
**Revisit trigger:** If a future reader cannot follow the supersedes chain from ADR-phase4-enforcement back to the original (a)/(b) framing context, revisit by adding a cross-reference note in `../2026-04-18-cli-approach/decisions.md` (master-canonical). If the mechanism-selection decision itself reopens (e.g. Spike B2 or B1 verdicts reverse), the retirement is moot — the whole ADR-phase4-enforcement decision reruns.

---
**2026-04-20 | SCOPE | definition**
**Decision:** Epic 5 (customisation MVP — single story `v2-custom-add-step`) is brought into MVP scope, re-scoping a minimal form of consumer-side customisation that discovery Out of Scope had listed as phase-deferred (reference §16.2 / §16.9). The full customisation scope (replace a skill, remove a skill, cross-project customisation reuse, UX polish) stays deferred; only "add one local node" is in MVP.
**Alternatives considered:** (A) Keep customisation fully phase-deferred — safer scope but leaves the §16.2 / §16.9 open question unanswered at MVP end; risks discovering at post-MVP adoption that customisation is structurally blocked (the non-fork failure mode). (B) Full customisation in MVP — too broad; UX alone blows up the scope. (C) Minimal probe (chosen) — one local node added, upgrade preserves it, surfaces gaps without exploding scope.
**Rationale:** Answering the customisation question during MVP rather than after preserves non-fork credibility (Risk 6). A minimal probe is cheap relative to the risk of finding out post-MVP that non-fork is only half-true without customisation support. The probe either validates the current shape (stronger non-fork) or surfaces a structural gap (known rather than latent); either outcome is an MVP win.
**Made by:** Operator (craigfo), 2026-04-20, during /definition Step 6 scope accumulator review.
**Revisit trigger:** If `v2-custom-add-step` implementation reveals that the minimal probe requires structural changes to the workflow-declaration schema, re-scope either by expanding Epic 5 (if feasible) or by formally deferring customisation (if not). If Epic 3 DoD reveals customisation isn't needed to validate MVP (non-fork holds without it), Epic 5 can be dropped — the probe was just a probe.

---

## Architecture Decision Records

<!-- No feature-level ADRs recorded in v2. Structural decisions with long-term implications are recorded in the repo-level register at `.github/architecture-guardrails.md` per `copilot-instructions.md §Architecture standards`. Relevant repo-level ADRs for this feature: ADR-013 (Phase 4 enforcement architecture — shared 3-operation governance package), ADR-phase4-enforcement (Mechanism selection), ADR-004 (context.yml canonical), ADR-002 (Gate evidence fields, not stage-proxy), ADR-003 (Schema-first). If a structural decision emerges from /definition or downstream that constrains future features, add it to `.github/architecture-guardrails.md` as a repo-level ADR — not as a feature-level ADR-NNN. -->
