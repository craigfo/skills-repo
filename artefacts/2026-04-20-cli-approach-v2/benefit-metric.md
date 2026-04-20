# Benefit Metric: CLI approach for AI-assisted workflow (v2)

<!--
  USAGE: Canonical format for all benefit-metric artefacts produced by the /benefit-metric skill.
  Every metric defined here must be traceable forward to at least one story via the definition skill.
  Every story must trace back to at least one metric here.
  Orphaned metrics (no stories) and orphaned stories (no metric) are pipeline failures.

  To evolve this format: update this file, open a PR, tag product lead + engineering lead.
-->

**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md` (Approved 2026-04-20, craigfo)
**Supersedes:** `../2026-04-18-cli-approach/benefit-metric.md` (2026-04-18; on master). Prior version retained master-canonical for historical reference.
**Date defined:** 2026-04-20
**Metric owner:** craigfo (feature owner / CLI maintainer) for M1–M5 + MM2 + MM3. heymishy (platform maintainer, `p4-enf-cli` owner) contributes signal for M3 gate-reverification and MM1 end-to-end adoption fidelity at the adapter-code seam.

---

## Tier Classification

**⚠️ META-BENEFIT FLAG:** Yes

<!-- The feature delivers a product (usable CLI for the operator across the full feature lifecycle) and validates a hypothesis (does the CLI mechanism — per ADR-phase4-enforcement — actually deliver P1–P4 fidelity at a level the operator adopts, beyond the Spike B2 artefact-level verdict). Tier 1 carries product outcomes; Tier 2 carries the meta-learning about the CLI mechanism's adoption viability. This meta-benefit is distinct from the 2026-04-18 version's "Spike B2 viability verdict" meta-metric, which is now resolved (PROCEED 2026-04-19). -->

**Tier 3 (compliance / risk-reduction):** Not applicable. `.github/context.yml` has `meta.regulated: false`, `compliance.frameworks: []`. The CLI preserves existing audit signals (ADR-003 hash-at-execution-time, POLICY.md floors, assurance-gate re-verification) but does not introduce new compliance obligations. Theme F boundary per `theme-f-inputs.md §4`: this feature informs but does not deliver regulatory compliance.

---

## Tier 1: Product Metrics (User Value)

### Metric 1 — Skill-as-contract (P1)

| Field | Value |
|-------|-------|
| **What we measure** | Proportion of CLI-executed skill invocations where (a) envelope-build hash verification correctly classifies the skill body (pass on match, abort on deliberate tampering); (b) returned artefact satisfies the declared per-node output contract (shape check against the workflow declaration). Measured as two sub-rates: `hash-classification-correct%` and `output-shape-valid%`. |
| **Baseline** | Not yet established — the 7 stub commands in `src/enforcement/cli-adapter.js` produce no envelope-build hash classification today. `advance` and `emitTrace` have real logic; the other 7 return `{ status: 'ok' }`. Baseline measured at MVP first-run across the two existing projects once the 7 stubs are fleshed via `p4-enf-cli` and the full workflow graph is declared. |
| **Target** | 100% on both sub-rates across the MVP test harness and across both validation projects. Zero false positives (valid skill rejected). Zero false negatives (tampered skill accepted). Output-shape validation produces an actionable error when shape fails. |
| **Minimum validation signal** | ≥95% on either sub-rate across 50 consecutive invocations across both projects combined. Below that, there is a design flaw in envelope-build or shape validation — stop and reshape the seam, not the harness. |
| **Measurement method** | Integration test harness in `tests/` covering the CLI path. Run by CLI maintainer on every release and by operator on consumer-reported incidents. Harness includes deliberate-tampering test cases and deliberate-shape-mismatch cases. Cross-referenced against the adapter-code ACs in `p4-enf-cli` (AC3 hash verify; AC4 trace gate-acceptance). |
| **Feedback loop** | If sub-rate drops below 95%: CLI release blocked; open a story to diagnose. If rate is 95–99% but below target: CLI release conditional on a regression-test addition for the failure case. Operator decides. If diagnosis surfaces a gap in the shared `governance-package.js` (not the CLI adapter), kick back to `p4-enf-package` owner. |

### Metric 2 — Active context injection (P2)

| Field | Value |
|-------|-------|
| **What we measure** | Proportion of skill invocations where the CLI envelope is the structural context path (skill content + standards + prior artefacts + target path + shape expectations all traceable to platform-assembled envelope, not to ambient operator-session context). Measured via trace-field presence + off-envelope distinguishability test. |
| **Baseline** | Not yet established. Current platform state (chat-native progressive skill disclosure in Copilot / Claude Code): context assembly is operator-mediated; no envelope boundary exists. Baseline = 0% structurally-enforced envelope path. |
| **Target** | 100% of Mode 1 invocations produce an envelope structurally before handoff; 100% of traces record the assembled context. Caveat (Risk 5 in discovery; Spike B2 P2 PARTIAL finding): Mode 1 constraint envelope is declarative-only — agent-side ambient-context leak is not structurally prevented in Mode 1. Target is structural completeness of *envelope build*, not leak-proof-ness of *agent session*. |
| **Minimum validation signal** | 100% envelope-produced-before-handoff rate (binary — any invocation without an envelope is a P2 break). Ambient-leak rate not assessed at MVP; carried forward as residual risk to Mode 2 discovery (out-of-scope). |
| **Measurement method** | Trace validator in the CLI test suite. Off-envelope distinguishability test: deliberately run a skill outside the CLI envelope (directly in operator's agent session with no `skills-repo advance` invocation) and verify the trace either records the absence or the operator cannot advance state. Run by CLI maintainer on every release. |
| **Feedback loop** | Any invocation without an envelope blocks release. Ambient-leak observed (not prevented) is logged as residual risk; carried forward to Mode 2 discovery where the constraint envelope can be runtime-enforced. If the two existing projects surface an operator pattern that structurally requires ambient context, flag before declaring MVP done. |

### Metric 3 — Per-invocation trace anchoring (P3)

| Field | Value |
|-------|-------|
| **What we measure** | (a) `trace-emission%` — proportion of CLI transitions (`advance`, `back`, `navigate`) that emit a trace entry matching `scripts/trace-schema.json`: six required fields (`skillHash`, `inputHash`, `outputRef`, `transitionTaken`, `surfaceType`, `timestamp`) + optional `skillId` + optional `executorIdentity`. (b) `gate-reverification%` — proportion of CLI-emitted traces accepted by existing `assurance-gate.yml` re-verification on PR without a new parallel gate. (c) `hash-matching-across-runs%` — proportion of same-skill-same-workflow run pairs producing identical `skillHash` values in trace. |
| **Baseline** | Not yet established. Traces today are gate-emitted only; `emitTrace` has real logic in the scaffold but is not yet wired into full-workflow-graph use. Baseline measured at MVP first-run. |
| **Target** | (a) 100% emission; (b) 100% re-verification without gate modification (Spike B2 A2 resolution supports this); (c) 100% hash match across identical runs. |
| **Minimum validation signal** | (a) ≥98%; (b) ≥95% (below that, something about the schema or the gate has drifted since Spike B2 — investigate as a workstream, not an incremental fix); (c) 100% — anything below 100% breaks ADR-003's primary audit signal; hard failure, stop. |
| **Measurement method** | Trace validator + CI assurance-gate logs. Measured by CLI maintainer on every release and by platform maintainer (heymishy) post-PR-merge on the assurance-gate side. Both validation projects contribute signal. |
| **Feedback loop** | (a) <98%: CLI release blocked on missing-transition diagnosis. (b) <95%: investigate gate + schema + `executorIdentity` handling; A2 was resolved at Spike B2 time — if the signal has decayed, treat as schema drift not as new spike-worthy uncertainty. (c) <100%: halt — ADR-003 hard failure. |

### Metric 4 — Interaction mediation (P4)

| Field | Value |
|-------|-------|
| **What we measure** | For workflow nodes whose skill prescribes per-exchange mediation ("ask one question, wait for answer" — C7), the proportion of invocations where the envelope permitted exactly one exchange per invocation, not an agent-authored complete artefact from a batched prompt. Observable via trace inspection. Agent never sees the workflow graph in any invocation. |
| **Baseline** | Not yet established. Current platform state: winging-it failure mode observed and documented (phase4-5 §Problem 2). Batched multi-exchange artefacts can pass schema validation today. |
| **Target** | 100% of per-exchange-prescribed invocations show exactly one exchange per invocation in trace. Zero traces showing batched-artefact production for skills that prescribe per-exchange. Agent-visible-graph rate: 0% (structural, not measured — the CLI does not surface graph topology in any envelope). |
| **Minimum validation signal** | ≥95% across the MVP harness combined over both projects. Below that, P4 mediation is convention rather than structure — reshape the envelope-construction logic. Mode 1 caveat (Spike B2 P4 PARTIAL): multi-turn in the operator's agent session after envelope handoff is not structurally prevented; carry as residual risk, not as a metric failure at MVP. |
| **Measurement method** | Trace inspection by CLI maintainer + periodic operator audit across the two validation projects. MVP workflow declaration must include at least one per-exchange-prescribed node (e.g. /discovery's conversational pattern) for this metric to be measurable. |
| **Feedback loop** | <95% (structural): diagnose whether the envelope permits batching (envelope-construction bug) — operator + CLI maintainer review. Mode 1 declarative-only multi-turn leak observed: log as residual risk, not a failure; Mode 2 is the structural closure path (out-of-scope for MVP). |

### Metric 5 — Non-fork adoption across two existing projects

| Field | Value |
|-------|-------|
| **What we measure** | Proportion of the **two validation projects** (from discovery Why Now #2 / Clarify Q3 — existing real repos, unnamed) that complete the MVP flow (from `init` through at least one full feature cycle, plus one `upgrade` cycle once available) without performing a `git clone` + commit of the skills repository into the project repo. Consumer project contains only the sidecar (`.skills-repo/` or equivalent managed paths) + lockfile + feature artefacts — no in-place copies of SKILL.md / POLICY.md / standards files under operator-authored paths. Permanent-exclusion list (Spike C addendum-1d) honoured on both `init` and `upgrade`. |
| **Baseline** | Current platform adoption (pre-CLI across operator's two existing projects): 0% non-fork — neither project has adopted the platform yet. Baseline established by snapshotting each project's pre-adoption state before `init`. |
| **Target** | 2/2 existing projects complete the MVP flow without forking. `upgrade` cycle completes at least once across one of the two projects (even if breaking-change UX is deferred). Permanent-exclusion list violated = 0 writes to `pipeline-state.json`, `context.yml`, `copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `product/**`. |
| **Minimum validation signal** | 1/2 projects completes the full flow without forking and without permanent-exclusion-list violations. 0/2 is a design failure — reshape `init` / sidecar before continuing. Second-party consumers remain out-of-scope for MVP validation per Q3. |
| **Measurement method** | Operator review of each project's git log + directory structure post-install and post-`upgrade`: look for absent in-place copies, present lockfile in sidecar, no writes to exclusion-list paths. Measured at each project's MVP adoption event + each `upgrade` event. |
| **Feedback loop** | If either project forks during MVP: diagnose whether the adoption path was unclear (operator-facing docs / `init` UX gap — scope owned by this feature) or whether a structural property pushed them to fork (then reshape the sidecar model — cross into `p4-enf-cli` adapter-code scope if relevant). If a permanent-exclusion-list write occurs: halt — that's a Spike C addendum-1d violation; patch the CLI before proceeding. |

---

## Tier 2: Meta Metrics (Learning / Validation)

<!--
  Use this section when the initiative also tests a hypothesis about process,
  tooling, or team capability. Common in early-stage agentic tooling rollouts.
-->

### Meta Metric 1 — Real end-to-end adoption fidelity

| Field | Value |
|-------|-------|
| **Hypothesis** | The CLI mechanism (per ADR-phase4-enforcement for regulated / CI surface class) delivers P1–P4 fidelity at a level the operator actually adopts in live usage across a full feature lifecycle — beyond the Spike B2 artefact-level PROCEED verdict (2026-04-19, which evaluated the design, not live adoption). |
| **What we measure** | Composite signal across the two validation projects: (a) number of *full* feature cycles completed end-to-end via the CLI (not abandoned mid-cycle for chat-native); (b) operator-reported blockers attributable to CLI mechanism vs. to unrelated project-specific issues; (c) P1–P4 per-invocation fidelity observed in live usage (M1, M2, M3, M4 rolled up across live traces, not just harness tests). |
| **Baseline** | Not yet established — no operator has used the CLI end-to-end across a full feature cycle on a real project. Baseline = 0 full cycles. |
| **Target** | At least 1 full feature cycle completed end-to-end via the CLI across **each** of the two validation projects (2 cycles minimum). Operator-reported CLI-attributable blockers per cycle: trending down between cycles 1 and 2. Live-usage P1 + P3 SATISFIED (as per Spike B2); P2 + P4 PARTIAL accepted (as per Spike B2 Mode 1). |
| **Minimum signal** | At least 1 full feature cycle completes end-to-end on at least 1 project, without mid-cycle abandonment to chat-native. Cycle-1 CLI-attributable blocker count is bounded — not "every step hits a blocker." Below that, the mechanism is not usably adoptable at current maturity; reshape before continuing. |
| **Measurement method** | Operator journal of each cycle across both projects: note start, checkpoint invocations, blockers encountered (classify CLI-attributable vs. project-specific), outcome (completed / abandoned / partial). Cross-referenced with traces from M1–M4. Reviewed at MVP checkpoint and at each subsequent cycle. |

### Meta Metric 2 — Workflow portability across runtimes

| Field | Value |
|-------|-------|
| **Hypothesis** | Graph-declared workflows execute comparably across different runtimes (CLI + chat-native harness), validating the workflow-as-first-class-declaration claim. A second runtime consuming the same declaration produces traces structurally comparable to the CLI's for the same skill content. |
| **What we measure** | (a) For the MVP workflow declaration, `non-linear-scenario-success%` — does the CLI execute the graph faithfully under operator-driven non-linear navigation (advance, back, navigate across branches)? (b) Cross-runtime trace comparability — does a chat-native harness (Copilot Chat or Claude Code consuming the same declaration) produce a trace whose `skillHash` matches the CLI's for the same skill content? |
| **Baseline** | Not yet established. Current platform: single-runtime execution (chat-native, progressive skill disclosure). No second runtime consumes workflow declarations today. |
| **Target** | (a) 100% of non-linear-navigation scenarios in the MVP harness execute as declared. (b) At least one demonstrated hash-equivalent trace pair (CLI + chat-native) from the same declaration, where `skillHash` values match even though runtime-specific trace fields (`surfaceType`) differ. |
| **Minimum signal** | (a) ≥90% — below that, the graph-model implementation has a gap that reopens Q5 (workflow-declaration-as-contract) structurally. (b) Cross-runtime comparability demonstrated even if full hash-equivalence is not reached in every node (mechanism-specific fields not violating the portability claim). |
| **Measurement method** | Integration test harness for (a); cross-runtime comparison exercise at MVP completion for (b). Run by CLI maintainer + (for the chat-native side) operator running through the same declaration manually. |

### Meta Metric 3 — Coreutils sharpness discipline

| Field | Value |
|-------|-------|
| **Hypothesis** | The "small sharp commands, no reasoning tools" discipline (Unix-violation guardrail) holds under contribution pressure over six months post-MVP. |
| **What we measure** | At six-month review, each CLI command audited against the Unix-violation criterion: does the command do one deterministic procedural thing, or has it accreted reasoning behaviour? Boolean per command; aggregate `commands-still-sharp%`. |
| **Baseline** | MVP launch state: 9 commands (`init`, `fetch`, `pin`, `verify`, `workflow`, `advance`, `back`, `navigate`, `emitTrace`), all deterministic by design. 100% sharp at launch (once p4-enf-cli completes the 7 stubs). |
| **Target** | 100% at six-month review — no command has accreted reasoning. |
| **Minimum signal** | ≤1 command found to have drifted AND rolled back or refactored within one release cycle of the discovery finding. Drift of >1 command without rollback triggers a Unix-violation retrospective: review contribution model and guardrails. |
| **Measurement method** | CLI maintainer + operator audit at 6 months post-MVP, repeated at 12 months. Audit criteria documented in `CONTRIBUTING.md` (or equivalent) for the CLI component. |

---

## Metric Coverage Matrix

<!--
  Populated by the /definition skill after stories are created.
  Every metric must have at least one story. Every story must reference at least one metric.
  Gaps here are pipeline failures — surface them before coding begins.
-->

| Metric | Stories that move it | Coverage status |
|--------|---------------------|-----------------|
| M1 — Skill-as-contract (P1) | v2-decl-outer-loop, v2-decl-inner-loop-support, v2-e2e-project1, v2-e2e-project2, v2-custom-add-step | Covered |
| M2 — Active context injection (P2) | v2-e2e-project1, v2-e2e-project2 | Covered (live signal; Mode 1 PARTIAL caveat carried from Spike B2) |
| M3 — Per-invocation trace anchoring (P3) | v2-install-sidecar-lockfile (install-boundary), v2-e2e-project1, v2-e2e-project2 | Covered |
| M4 — Interaction mediation (P4) | v2-decl-outer-loop, v2-decl-inner-loop-support, v2-e2e-project1, v2-e2e-project2 | Covered (live signal; Mode 1 PARTIAL caveat) |
| M5 — Non-fork adoption across two existing projects | v2-install-init (project 1 1/2), v2-install-sidecar-lockfile, v2-install-collision-detection, v2-e2e-project2 (project 2 2/2), v2-e2e-upgrade, v2-custom-add-step | Covered |
| MM1 — Real end-to-end adoption fidelity | v2-e2e-project1 (cycle 1), v2-e2e-project2 (cycle 2) | Covered |
| MM2 — Workflow portability | v2-e2e-project1 (smoke only — full test out of MVP) | Partial — MVP carries smoke signal only; full validation is post-MVP |
| MM3 — Coreutils sharpness discipline | _[post-MVP 6-month review; not moved by any story in this MVP set]_ | Deferred measurement — MVP establishes baseline at launch; review event is separate artefact |

---

## What This Artefact Does NOT Define

- Individual story acceptance criteria — those live on story artefacts.
- Implementation approach — that is the /definition and spec skills.
- Sprint targets or velocity — these metrics are outcome-based, not output-based.
- The `p4-enf-cli` adapter-code ACs. Those are in `artefacts/2026-04-19-skills-platform-phase4/stories/p4-enf-cli.md`. This feature's stories (from /definition) reference them as upstream dependencies where relevant (per ownership split / Clarify Q2 / decisions.md).
