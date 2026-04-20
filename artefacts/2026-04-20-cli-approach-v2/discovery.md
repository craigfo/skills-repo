# Discovery: CLI approach for AI-assisted workflow (v2)

<!--
  USAGE: Produced by the /discovery skill. The structured outcome of early exploration —
  what problem we're solving, for whom, and what success looks like at the edges.

  Status must be "Approved" before /benefit-metric can proceed.
  MVP scope and out-of-scope fields are the primary review targets.

  To evolve: update this template, open a PR, tag BA lead + product lead.
-->

**Feature folder:** `artefacts/2026-04-20-cli-approach-v2/`
**Supersedes:** `artefacts/2026-04-18-cli-approach/discovery.md` (Approved 2026-04-18; on `heymishy/skills-repo` master; preserved unchanged for historical reference along with its sibling `benefit-metric.md`, `decisions.md`, and `reference/`).

**Status:** Approved
**Created:** 2026-04-20 (v2 folder)
**Clarified:** 2026-04-20 via /clarify (three questions resolved; see Clarification log below).
**Approved by:** craigfo — 2026-04-20
**Author:** Claude (operator-driven conversational run through /discovery + /clarify)

**Re-run rationale:** The prior discovery was Approved 2026-04-18 and landed on `heymishy/skills-repo` master. Between then and 2026-04-20, Phase 4 (`artefacts/2026-04-19-skills-platform-phase4/`) also landed on master. Phase 4 delivered Spike A / B1 / B2 / C verdicts, ADR-013 (shared 3-operation governance package as the surface-adapter contract), ADR-phase4-enforcement (mechanism per surface class), a working implementation scaffold at `src/enforcement/cli-adapter.js` matching the prior feature's 9-command design, `theme-f-inputs.md` authoritative for Theme F scope, and `scripts/trace-schema.json` canonical for trace entries. Those changes supersede or resolve material sections of the prior discovery. This v2 folder contains the re-run; the prior discovery and its siblings are left on master unmodified.

**Reference material consumed:**

- `reference/link-phase4-landed-artefacts.md` — pointer file listing Phase 4 outputs, ADR-013, trace schema, scaffold location, Theme F inputs, and directives for this re-run. (Duplicated into this v2 folder from master at `../2026-04-18-cli-approach/reference/link-phase4-landed-artefacts.md`.)
- `reference/link-ref-skills-platform-phase4-5.md` — pointer to the phase4-5 strategic horizon reference (status: backgrounder per pointer-file reclassification). (Duplicated into this v2 folder from master at `../2026-04-18-cli-approach/reference/link-ref-skills-platform-phase4-5.md`.)
- `../2026-04-18-cli-approach/discovery.md` — the 2026-04-18 Approved discovery (master). Source for all content not contradicted by Phase 4 outputs.
- `../2026-04-18-cli-approach/reference/012-cli-approach-explained-v2.md` — overview (four actors, seam contract, toolbox vs. one tool, graph navigation primitives).
- `../2026-04-18-cli-approach/reference/013-cli-approach-reference-material.md` — comprehensive reference against existing platform primitives (several §16 open questions resolved by Spike A / Spike C).
- `../2026-04-18-cli-approach/reference/pr-comments-98.md`, `../2026-04-18-cli-approach/reference/pr-comments-155.md` — verbatim PR conversations.
- `../2026-04-19-skills-platform-phase4/discovery.md` + `benefit-metric.md` — Phase 4 outer-loop foundation.
- `../2026-04-19-skills-platform-phase4/decisions.md` — Spike A / B1 / B2 / C / C-addendum-1d decisions.
- `../2026-04-19-skills-platform-phase4/spikes/*` — spike verdicts and rationale.
- `../2026-04-19-skills-platform-phase4/theme-f-inputs.md` — Phase 4 / Theme F boundary; authoritative for Theme F scope.
- `../../.github/architecture-guardrails.md` — ADR-013 (shared 3-operation governance package), ADR-phase4-enforcement (mechanism per surface class).
- `../../scripts/trace-schema.json` — canonical JSON schema for trace entries (resolves reference §16.12).
- `../../src/enforcement/cli-adapter.js` — implementation scaffold exposing this feature's 9 commands; 2 real (`advance`, `emitTrace`), 7 stubs. Integrates with `governance-package.js` per ADR-013.
- `../2026-04-18-skills-platform-phase4-revised/ref-skills-platform-phase4-5.md` — strategic horizon (status: backgrounder per pointer-file reclassification).

**EA registry blast-radius:** No EA registry entry exists for this feature. The CLI enforcement adapter, workflow declaration, and shared governance package are new platform primitives; registration is a post-MVP concern for /definition or /reverse-engineer. `architecture.ea_registry_authoritative: true` is set in `.github/context.yml`; with no `systemId` to query, `getBlastRadius()` is not called. This does not block discovery.

---

## Problem Statement

AI coding agents are reliable at reasoning and context-transformation, and unreliable at sequencing, path discipline, and self-verification. For casual use the non-determinism is tolerable; for governed delivery — where auditors must answer *what was the agent doing, against which instructions, can I verify that?* — it breaks **demonstrability**, the property the platform's primary audit signal (ADR-003 hash-at-execution-time) depends on.

Three categories of work are fragile when delegated to an agent: sequencing (which skill or step comes next), path discipline (reading inputs from and writing outputs to declared locations), and self-verification (claiming the work is done without independent evidence). Each outer-loop cycle costs operator attention to re-check sequencing and landing paths; each assurance artefact becomes an attestation of process rather than a demonstration of it.

**Who experiences it:** AI-operators (attention cost per cycle, rework when steps land wrong); tech leads (cannot trust that the governance chain on a PR *demonstrates* what governed the delivery); platform maintainers (adoption today biases toward forking, severing the update channel); auditors / risk reviewers (cannot independently verify the instruction set that ran without out-of-band reconstruction).

**How often:** every agent-driven step in every feature. Default state today, not an edge case.

---

## Who It Affects

**Primary:**

- **Developer / engineer (outer-loop operator)** — running /discovery through DoR and then the inner loop on a feature. Wants to move work through the pipeline without babysitting step sequencing, output paths, or self-verification claims. Hits the problem on every agent-driven step.
- **Tech lead / squad lead** — owns squad-level delivery governance, reviews exceptions, signs DoR. Wants to trust that the governance chain recorded on a PR *demonstrates* what governed the delivery rather than *attests* to it. Hits it when an audit signal is an attestation and cannot be independently reconstructed.
- **Platform maintainer** — owns the core skill library, registry, and upstream update channel. Wants to ship skill / template / standards updates to consumer repositories without forcing forks, and keep POLICY.md floors invariant across upgrades. Hits it when adoption implicitly requires a fork, severing the update channel.
- **Auditor / risk reviewer (non-engineer)** — reviewing an assurance trace on a merged PR to answer "what instruction set governed this, which standards applied, can I verify this?" without engineering assistance. Hits it when the evaluator is the same actor as the recorder, or when the trace cannot be re-verified against a workflow declaration.

**System actors (named because maker/checker allocates responsibility):**

- **CI (continuous integration) runner** — today `assurance-gate.yml` and `trace-commit.yml`. Under the CLI approach, its scope extends to re-verifying consumer-side CLI trace emissions before committing them to durable storage. Record-commit authority.
- **Consumer squad (adopting organisation)** — wants to consume the platform and receive skill updates without forking upstream. Hits the problem when adoption biases toward forking, severing the update channel and breaking C1 (`product/constraints.md` §1).

**Secondary (affected through artefact quality, not the seam directly):**

- Product manager / BA (business analyst), CoP (community of practice) leads — participate in outer-loop /discovery, /benefit-metric, /definition. Affected indirectly through trace integrity and floor propagation.

---

## Why Now

The structural seam the CLI approach depends on is now the declared platform architecture, not a proposal. Phase 4 landed on 2026-04-19/20 with Spike A / B1 / B2 / C all PROCEED, ADR-013 (shared 3-operation governance package as the surface-adapter contract), and ADR-phase4-enforcement (CLI selected for regulated / CI, MCP for VS Code / Claude Code interactive). A working scaffold at `src/enforcement/cli-adapter.js` already exposes this feature's 9-command design — 2 commands real (`advance`, `emitTrace`), 7 stubs. The architectural window has effectively closed; what remains is implementation, consumer validation, and unfrozen scope decisions.

**What is time-sensitive now:**

1. **Mode 2 scope decision.** Spike B2 Open Item 1: declare whether Mode 2 (headless subprocess, the structural closure path for P2 and P4 on regulated / CI surfaces) is in scope for the p4-enf-cli implementation story, or whether Mode 1 with residual-risk documentation is the Phase 4 target. This is a live decision, not a future one.
2. **First consumer adoption — operator self-validation across two existing projects.** The scaffold has 7 command stubs; even the operator cannot *use* the CLI end-to-end until the stubs are real and the full workflow graph is declared. Validation target for MVP: the operator installs the CLI into **two existing (unnamed) projects** — real repos with live work, not synthetic test scaffolds — and runs at least one full feature cycle end-to-end through each. Two projects rather than one so cross-project quirks surface (not just single-repo artefact-of-setup). Existing projects rather than fresh test repos so the non-fork mechanism is exercised against realistic repo structure, not a synthetic empty one. This validates M2 (consumer confidence — can the operator actually use the tool they built?), M5 (non-fork adoption existence proof — no git-clone fork required for install or upgrade), and stress-tests A4 (seam envelope sufficiency) and A7 (progressive skill disclosure compatibility). Second-party consumers are out-of-scope for MVP validation.
3. **Consumer-side customisation.** Reference §16.2 / §16.9 — add a step, replace a skill — remain open. Spike C resolved upstream authority, install semantics, and upgrade semantics, but not customisation. A real consumer will force the question; answering it in advance preserves the non-fork property.

---

## MVP Scope

**Positioning within the landed Phase 4 architecture:**

- **CLI is the E3 structural-enforcement adapter for the regulated / CI surface class** per ADR-phase4-enforcement. One of several mechanisms in E3 — not *the* governance mechanism. MCP is the peer adapter for VS Code / Claude Code interactive.
- **CLI calls into the shared 3-operation governance package** (`src/enforcement/governance-package.js`) per ADR-013. Package owns governance logic (`resolveAndVerifySkill`, `evaluateGateAndAdvance`, `writeVerifiedTrace`); CLI owns the seam (envelope build, state navigation, trace format, workflow-graph traversal). No reimplementation of governance logic inside the CLI.

**Shape — Mode 1 only:**

- **Integration mode — Mode 1 (human-driven interactive).** CLI writes the seam envelope as a prompt file and exits. Operator takes it to their existing agent session (Copilot Chat, Claude Code, Cursor) — whichever they have and are authenticated to. CLI itself does not handle credentials or couple to a specific vendor; the operator's session does.
- **Delivery surface — git-native.** Sidecar is a directory under the consumer's repo; lockfile is a committed JSON file; trace artefacts are files in the consumer's tree.

**Command set — scaffolded in `src/enforcement/cli-adapter.js`:**

- Nine commands: `init`, `fetch`, `pin`, `verify`, `workflow`, `advance`, `back`, `navigate`, `emitTrace`.
- Two have real logic: `advance` (ADR-002 transition validation → C5 hash verification via `govPackage.verifyHash` → `govPackage.advanceState`; typed errors `TRANSITION_NOT_PERMITTED`, `HASH_MISMATCH`); `emitTrace` (validated trace entry — `skillHash`, `inputHash`, `outputRef`, `transitionTaken`, `surfaceType`, `timestamp`; MC-SEC-02 compliant).
- Seven stubs returning `{ status: 'ok', command: '…' }`. Completing them is the bulk of p4-enf-cli.
- `upgrade` deferred until a first consumer has a lockfile to upgrade from.

**What must be true for the first person who uses it to find it useful:**

1. Skill body handed to the agent matches the workflow's declared hash; a mismatch aborts the step (C5 at envelope-build via `govPackage.verifyHash`).
2. Sidecar install does not require forking. Upstream is `heymishy/skills-repo` (Spike C); consumer sets `skills_upstream.url` in `context.yml`.
3. Agent outputs land at the declared target path, or the CLI surfaces the gap before `advance` (output-contract check via `govPackage.evaluateGateAndAdvance`).
4. Workflow state advances only after shape verification succeeds.
5. Trace artefact emitted by `emitTrace` is re-verifiable by the existing `assurance-gate.yml` against the same workflow declaration — A2 resolved (Spike B2: gate accepts CLI traces without modification).
6. Operator is the navigator across the workflow graph (`advance`, `advance --to=<step>`, `back`, `navigate <step>`); the agent never sees the graph. Sequencing is removed from agent responsibility.

**Verification contract — per-node fields inside the workflow declaration** (realised in `theme-f-inputs.md §2`): each node declares `allowedTransitions`, optional `expected-output-shape` (JSON Schema), skill hash, approval-gate metadata. No dedicated `verify-contract.json` in MVP.

**Trace schema — `scripts/trace-schema.json` is canonical** (resolves reference §16.12): six required fields (`skillHash`, `inputHash`, `outputRef`, `transitionTaken`, `surfaceType`, `timestamp`) + optional `skillId` + optional `executorIdentity`. `executorIdentity` is optional; Theme F reviewers cannot require its presence.

**Install / upgrade — permanent exclusion list** (Spike C addendum-1d; hardcoded, not configurable via `context.yml`): `pipeline-state.json`, `pipeline-state.schema.json`, `context.yml`, `copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `fleet/`, `fleet-state.json`, `product/**`. `architecture-guardrails.md` is managed-merge (upstream sections added; consumer-authored `## ADR-NNN` blocks preserved; conflict halts upgrade). Consumers may add extra exclusions via `context.yml: skills_upstream.extra_exclusions` but cannot remove baseline.

**Theme F boundary — per `theme-f-inputs.md §4`:** this feature's outputs (CLI verification contract, workflow declaration structure, optional `executorIdentity`) are Theme F *inputs*, delivered by `p4-enf-second-line`. Theme F's own deliverables (dual-authority approval, RBNZ / HQSC / other sectoral-regulator compliance integration, second-line governance workflow, approval routing orchestration) are out-of-scope (see Out of Scope).

**Full workflow graph declared — end-to-end usable, not a single-phase demonstrator.** For the CLI to be worth adopting, the operator has to be able to *use* it across the full outer loop (and the inner-loop coding sub-steps), not just run one step to prove the seam. The MVP workflow declaration therefore covers every node the operator reaches for during a feature's lifecycle: /discovery, /benefit-metric, /definition, /review, /test-plan, /definition-of-ready, /decisions, the inner loop (/branch-setup, /implementation-plan, /subagent-execution, /verify-completion, /branch-complete), /definition-of-done, /trace, plus the support skills that compose with them (/workflow, /clarify, /estimate, /checkpoint, /tdd, /systematic-debugging, /implementation-review). Each node carries `allowedTransitions`, optional `expected-output-shape`, skill hash, and approval-gate metadata per `theme-f-inputs.md §2`. Authoring this declaration is a substantial body of work — it is the MVP's largest tranche of authoring, not an afterthought. /definition decomposes how it is authored, reviewed, and kept in sync with the skills as they evolve.

**Relationship to Phase 4 `p4-enf-cli`:** ownership is split. `p4-enf-cli` (DoR'd 2026-04-19; under Phase 4 E3) owns the **CLI adapter code** — fleshing the 7 stubs in `src/enforcement/cli-adapter.js` (`init`, `fetch`, `pin`, `verify`, `workflow`, `back`, `navigate`), hardening the 2 real commands (`advance`, `emitTrace`), wiring into `governance-package.js`, and passing its 4 ACs (9 commands implemented with unit tests; `allowedTransitions` enforced; hash verify enforced; trace passes assurance gate). This **cli-approach** feature (in /definition after discovery approval) owns everything *else* needed for operator end-to-end usability: the full workflow-graph declaration (15+ nodes above), operator-facing documentation, the first-run integration guide, any `init` UX work beyond the stub replacement, and the customisation / upgrade / sidecar-collision behaviours not covered by p4-enf-cli's ACs. Dependency: the operator cannot self-consume the tool until p4-enf-cli reaches DoD — adapter code is prerequisite. Timing: this feature's /definition may proceed in parallel with p4-enf-cli implementation; the stories it produces declare the dependency where an AC transitively needs adapter code in place.

---

## Out of Scope

**Architectural non-goals (permanent — not deferred):**

- **Replacing SKILL.md as the unit of governed agent behaviour.** SKILL.md remains the instruction set. The CLI delivers it hash-verified; it does not redefine, mutate, or compile it.
- **Replacing the assurance gate.** The CLI is a consumer-side executor. `assurance-gate.yml` + `trace-commit.yml` remain the independent recording and enforcement point. Spike B2 confirmed A2: existing gate re-verifies CLI-emitted traces with no modification.
- **Giving the agent sequencing authority.** The agent never decides what step comes next, even in Mode 3 (CLI-as-MCP-server). Workflow-driven sequencing is the reliability property the architecture rests on.
- **New governance model.** No new floors, no new gate semantics, no new approval model. The CLI adapter enforces what ADR-013 + ADR-phase4-enforcement already declare.
- **Vendor-specific integration.** The seam contract is agnostic across Copilot, Claude Code, Cursor, and future agent runtimes. No single-vendor path ships.
- **Reimplementing governance logic inside the CLI.** ADR-013 binds all surface adapters to the shared 3-operation package. The CLI may not fork, inline, or duplicate `resolveAndVerifySkill`, `evaluateGateAndAdvance`, or `writeVerifiedTrace`.
- **Theme F deliverables** (per `theme-f-inputs.md §4`):
  - Dual-authority approval routing.
  - Governing-authority regulatory compliance integration (e.g. RBNZ (Reserve Bank of New Zealand), HQSC (Health Quality and Safety Commission), other sectoral authorities).
  - Second-line governance workflow (automated).
  - Approval routing orchestration.

  These belong to Theme F. `p4-enf-second-line` delivered the inputs this feature's outputs feed into; Theme F consumes them in a subsequent phase.

**Phase-deferred (MVP boundary — valid follow-ons, not in this feature):**

- **Mode 2 (headless subprocess / inference-API) and Mode 3 (CLI-as-MCP-server).** Mode 1 only for MVP. Mode 2 is the structural closure path for P2 / P4 on regulated/CI and is a live Phase 4 decision point for p4-enf-cli (Spike B2 Open Item 1) — phase-deferred here, not frozen.
- **Non-git-native surfaces** (IaC, SaaS-API, SaaS-GUI, M365-admin, manual). ADR-phase4-enforcement records this surface class as "deferred pending Spike D verdict."
- **Consumer-side workflow customisation** (adding a step, replacing a skill, removing a step). Reference §16.2 / §16.9 still open.
- **Upgrade UX for breaking skill-content changes.** `upgrade` command exists conceptually; breaking-change signalling and consumer sign-off deferred.
- **CLI distribution fallbacks** for consumers who cannot run npm-installed Node binaries.
- **Enterprise traceability — configurable commit-message-format validation.** Owned by the Phase 4 `p4-dist-commit-format` story; the CLI's `advance` is the enforcement point but this feature does not deliver it.
- **Install generates no commits.** Owned by `p4-dist-no-commits`. Implicit scope boundary here, not a named design property.

---

## Assumptions and Risks

**Assumptions (status after Phase 4 landed):**

1. **A1 — Auditors accept consumer-side evaluation when the recorder is independent.** *Partially validated.* Structural claim stands on its own technical merits (hash-verified envelope, declared-path artefact landing, trace schema aligned with existing gate). Open piece: auditor position on whether evaluation must run under their direct control, not just recording. Until a regulated consumer engages, this remains unvalidated.
2. **A2 — The existing `assurance-gate.yml` re-verifies CLI-emitted trace with minor-to-no modification.** **Resolved** by Spike B2 (2026-04-19). No gate modification required. `executorIdentity` optional; gate ignores it when absent.
3. **A3 — Mode 1 is sufficient to validate value.** *Partially validated.* Spike B2: P1 and P3 SATISFIED; P2 and P4 PARTIAL in Mode 1. Mode 2 is the closure path for structural P2 / P4 on regulated/CI. If value requires Mode 2 before first ship, scope expands.
4. **A4 — The seam envelope is sufficient context for agents in Mode 1.** *Unvalidated.* First real consumer engagement tests whether Copilot Chat / Claude Code / Cursor sessions need ambient context the envelope does not deliver.
5. **A5 — Workflow declarations can be authored and maintained as first-class artefacts.** *Unvalidated.* Authoring burden bounded; drift between declared workflow and actual skill library manageable. First real workflow declaration is the test.
6. **A6 — Coreutils-style sharpness discipline is sustainable.** *Unvalidated.* Six-month review target.
7. **A7 — Progressive skill disclosure and CLI-driven workflow execution compose cleanly.** *Unvalidated.* Cross-runtime hash equivalence — MM2.
8. **A8 — Spike A lands adequately (shared core or separate implementations).** **Resolved** by Spike A (2026-04-19 PROCEED) and codified in ADR-013. Outcome: shared 3-operation governance package. CLI operates as adapter.

**Risks:**

1. **Adoption friction narrows the audience.** npm install + sidecar + lockfile + new commands is more overhead than chat-native adoption. Consumers with low governance burden may prefer the lighter path; the CLI then serves regulated delivery only.
2. **Non-fork adoption un-exercised by MVP.** MVP demonstrates one outer-loop step; `upgrade` deferred until a first consumer has a lockfile. The signature non-fork property won't be proven until `upgrade` runs in anger.
3. **Independent runner dependency at consumer sites.** Maker/checker requires an independent recorder. Consumers without CI get local-only traces — not audit-grade.
4. **Double composition path fragments the improvement signal.** Chat-native progressive skill disclosure + CLI-driven workflow execution = two surfaces, two trace shapes, two places the improvement loop must reason about failure patterns.
5. **Constraint envelope is declarative-only in Mode 1.** Operator may read outside the declared envelope in their agent session. P2 and P4 PARTIAL in Mode 1 (Spike B2); Mode 2 is the resolution.
6. **Consumer customisation semantics are unresolved** (reference §16.2 / §16.9). A real consumer wanting to add a step hits "not supported yet" — non-fork credibility erodes.
7. **Second platform-team maintenance surface.** Workflow declarations + CLI command set = new maintenance surface on top of skills and standards. Finite bandwidth.
8. **Permanent-exclusion list drift.** Hardcoded list in the CLI may diverge from consumer-owned paths over time (new platform file category + stale exclusion list = potential overwrite on `upgrade`). Mitigation: CI governance check or test that `init` / `upgrade` write only within declared `managed_paths`.

---

## Directional Success Indicators

**Primary framework — P1–P4 per-invocation skill fidelity** (phase4-5 Spike B2 evaluation axes):

- **P1 — Skill-as-contract:** hash verification fires on a deliberate mismatch — CLI returns `HASH_MISMATCH` with a clear error and no envelope is delivered. Agent outputs land at the declared target path, or the CLI's shape check surfaces the gap before `advance`. Two runs of the same workflow node with the same skill content produce artefacts satisfying the same output-contract shape. *Spike B2: SATISFIED.*
- **P2 — Active context injection:** the CLI's envelope-build is the only structural path by which skill content, standards, prior artefacts, target path, and output-shape expectations reach the agent inside a skill invocation. Mode 1 caveat documented (declarative-only; ambient leak not prevented). *Spike B2: PARTIAL in Mode 1.*
- **P3 — Per-invocation trace anchoring:** every `advance`, `back`, `navigate` transition emits a trace entry matching `scripts/trace-schema.json`. An auditor can answer "what governed this action, which standards applied, was the output validated" from the emitted trace + the workflow declaration alone. Trace emitted by the CLI is accepted by the existing `assurance-gate.yml` without a new parallel gate. *Spike B2: SATISFIED.*
- **P4 — Interaction mediation:** the agent never sees the workflow graph. Each invocation's envelope delivers only the current node's scoped context — no ability to read the declaration, author a multi-node batched artefact, or advance state itself. Operator is the navigator. *Spike B2: PARTIAL in Mode 1 — Mode 2 closes structurally.*

**Secondary — distribution and adoption** (E2 epic; not P1–P4):

- A consumer adopts via `init` + sidecar + lockfile without forking `heymishy/skills-repo`. Upstream content (SKILL.md files, POLICY.md files, templates, standards, scripts) is materialised into managed sidecar directories under the consumer's repo and hash-pinned via the committed lockfile. The consumer does not edit upstream content in place; `upgrade` is the update channel. MVP validation target: two existing (unnamed) operator projects, each completing at least one full feature cycle end-to-end via the CLI.
- `upgrade` propagates an upstream skill change without forking: re-fetches, diffs, surfaces for review, re-pins. POLICY.md floors apply on next run.
- `init` and `upgrade` honour the permanent-exclusion list (Spike C addendum-1d) — no writes to `pipeline-state.json`, `context.yml`, `copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `product/**`. `architecture-guardrails.md` managed-merge preserves consumer-authored ADR blocks.

**Secondary — workflow portability** (MM2; not P1–P4):

- A second runtime (chat-native harness consuming the same workflow declaration) produces traces whose skill-body hashes match the CLI's for the same skill content. An auditor confirms the instruction set is the same regardless of runtime.

**Secondary — maintenance discipline** (MM3; not P1–P4):

- At six-month review, no CLI command has accreted reasoning behaviour. Coreutils-style sharpness holds under contribution pressure.

---

## Constraints

**Time:**

- The "now" window is a live decision window for Mode 2 scope (Spike B2 Open Item 1) and first consumer adoption. Not a finishing deadline.

**Budget / team capability:**

- Single-operator platform team (roles: tech_lead = qa = analyst = product per `.github/context.yml`). Scope must fit alongside ongoing skill and standards maintenance.

**Regulatory / governance (hard — inherited platform constraints; CLI must preserve, not relax):**

- **C1 — Non-fork distribution** (`product/constraints.md` §1). Sidecar + lockfile + managed paths; consumer never edits upstream in place; `upgrade` is the update channel.
- **C2 — POLICY.md floors non-negotiable** (§2). `fetch` / `pin` / `upgrade` propagate floors; no relaxation below declared minimum.
- **C3 — Spec immutability** (§3). CLI may not mutate story specs, ACs, DoR / DoD criteria, or POLICY.md floors.
- **C4 — Human approval gate for instruction-set changes** (§4). SKILL.md, POLICY.md, standards changes require human review before merge; CLI cannot auto-upgrade without human sign-off in its flow.
- **C5 — Hash-verified instruction sets** (§5; ADR-003 repo-level). Load-bearing at envelope-build via `govPackage.verifyHash`; hash recorded in trace.
- **C7 — One question at a time** (§7). Applies to any CLI-mediated skill invocation.
- **C11 — No persistent agent runtime dependency** (§11). CLI runs locally; `governance-package.js` is a pure module invoked per call; no hosted service introduced.
- **C13 — Structural governance preferred over instructional** (§13). Structural for C5 / C4 / MC-SEC-02 at the seams the CLI owns; Mode 1 constraint envelope is declarative (Risk 5) — Mode 2 makes it structural.
- **Theme F boundary** (per `theme-f-inputs.md §4`). This feature's outputs are Theme F inputs only; Theme F's own deliverables are out-of-scope (Out of Scope).

**Repo-level ADRs the CLI must comply with** (authoritative register: `.github/architecture-guardrails.md`):

- **ADR-013 — Phase 4 enforcement architecture.** Shared 3-operation governance package (`resolveAndVerifySkill`, `evaluateGateAndAdvance`, `writeVerifiedTrace`) is the contract all surface adapters call. CLI does not reimplement.
- **ADR-phase4-enforcement — Mechanism selection.** CLI for regulated / CI; MCP for VS Code / Claude Code interactive; chat-native and non-git-native deferred pending spikes.
- **ADR-004 — `context.yml` is the single config source of truth.** CLI configuration (upstream URL, surface type, pins, `skills_upstream.extra_exclusions`) sourced from `.github/context.yml`.
- **ADR-002 (repo-level) — Gate evidence fields, not stage-proxy.** `advance` delegates to `govPackage.evaluateGateAndAdvance`, which reads evidence fields.
- **ADR-003 (repo-level) — Schema-first.** Any new field written to `pipeline-state.json` is added to `pipeline-state.schema.json` in the same commit.

**Technical dependencies:**

- **npm** as the paradigmatic distribution channel (Spike C outcome). Alternate distributions deferred.
- **Existing `assurance-gate.yml` + `trace-commit.yml`.** Spike B2 confirmed they re-verify CLI-emitted traces without modification.
- **`workspace/state.json` and `.github/pipeline-state.json` schemas** — `advance` writes states that pass the existing validators.
- **Existing SKILL.md format.** Delivered hash-verified; not reshaped.
- **Existing surface adapter contract** (`execute(surface, context) → result`) for non-git-native futures. Not exercised by MVP.
- **Node runtime** on consumer sites.
- **`src/enforcement/governance-package.js`** — shared core per ADR-013. CLI is tightly coupled to its 3-operation interface.

**Stakeholder interface:**

- Auditor / risk reviewer does not run the CLI themselves. Their interface is the emitted trace (per `scripts/trace-schema.json`) + the workflow declaration, read on PR review and post-merge evidence.

---

## Clarification log

**2026-04-20 — Clarified via /clarify (conversational, Opus).** Three operator-answered questions after the /discovery re-run:

- **Q1 — Which outer-loop phase does the first declared workflow cover?** A: **None in isolation.** Full workflow graph required for MVP — the CLI must be end-to-end usable, not a single-phase demonstrator. MVP Scope item rewritten to cover every outer-loop skill plus the inner-loop coding sub-steps and composed support skills. Logged as SCOPE in /decisions (pending — see Follow-ups).
- **Q2 — Relationship between this feature's MVP and the already-DoR'd `p4-enf-cli` story?** A: **Split ownership.** p4-enf-cli (Phase 4 E3) owns the CLI adapter code and its 4 ACs. This cli-approach feature owns everything else needed for operator end-to-end usability — full workflow-graph declaration, operator-facing docs, first-run integration guide, customisation / upgrade / sidecar-collision behaviours not in p4-enf-cli's ACs. /definition proceeds in parallel with p4-enf-cli implementation; dependency declared on stories that transitively need adapter code in place. Logged as ARCH in /decisions (pending).
- **Q3 — First real consumer for M5 non-fork adoption existence proof?** A: **Operator self-validation across two existing (unnamed) projects.** Two projects so cross-project quirks surface; existing projects so the non-fork mechanism is exercised against realistic structure, not a synthetic test scaffold. Second-party consumers explicitly out of MVP validation scope. Logged as DESIGN in /decisions (pending).

**New or materially revised assumptions:** none in this /clarify pass. A1–A8 statuses stand as in the Assumptions section.

---

## Follow-ups (not in scope of /discovery)

- **cli-approach/decisions.md cleanup.** The first /clarify pass (2026-04-18) created feature-level "ADRs" numbered ADR-001 / ADR-002 / ADR-003, colliding with the repo-level register at `.github/architecture-guardrails.md`. Per `copilot-instructions.md` §Architecture standards, the repo-level register is authoritative and structural decisions go there. Cleanup actions:
  - Retire feature ADR-001 (CLI as Spike B2 reference implementation) — framing superseded by ADR-phase4-enforcement.
  - Demote feature ADR-002 (workflow-as-graph) to a plain log entry — decision content already captured in `theme-f-inputs.md §2` and `src/enforcement/cli-adapter.js`.
  - Demote feature ADR-003 (verification contract per-node) to a plain log entry — content already in `theme-f-inputs.md §2`.
- **benefit-metric.md refresh.** The 2026-04-18 metric set references the retired "Spike B2 reference implementation" framing and a "Spike B2 verdict" meta-metric that has now resolved (PROCEED). MM1 needs reformulating or closing; M3 feedback loop references a resolved Assumption A2.
- **Pipeline state write.** The /discovery skill's mandatory final step (write `stage: "discovery"`, `discoveryStatus: "clarified"`, `updatedAt: 2026-04-20` to `.github/pipeline-state.json`) is pending. Run `/workflow` to reconcile, or set manually.
- **New /decisions entries from this /clarify pass.** Three decisions to log:
  - **SCOPE (Q1):** Full workflow graph for MVP — not a single-phase demonstrator. Rationale: operator must be able to use the tool end-to-end to adopt it.
  - **ARCH (Q2):** Split ownership with `p4-enf-cli` — p4-enf-cli owns adapter code; this feature owns workflow-graph authoring, operator docs, integration guide, customisation/upgrade behaviours. Stories in parallel with dependency declared.
  - **DESIGN (Q3):** MVP validation target is operator self-consumption across two existing (unnamed) projects. Second-party consumers out-of-scope.

---

**Next step:** Human review and approval → /benefit-metric refresh pass (or approve discovery as-is and run /clarify if gaps remain).
