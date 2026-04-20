## Story: First full feature cycle on project 1 end-to-end via CLI

**Epic reference:** `../epics/e3-e2e-validation.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator self-consuming on project 1**,
I want to **run one complete feature lifecycle (discovery → DoD) on project 1 via the CLI using the full workflow declaration**,
So that **MM1 (real end-to-end adoption fidelity) records its first live-usage signal, and the assumption A4 (envelope sufficiency) is validated against a real agent session**.

## Benefit Linkage

**Metric moved:** MM1 (cycle 1 of 2 target), M1/M2/M3/M4 live signal, A4 (envelope sufficiency), A7 (progressive disclosure compatibility).
**How:** This is the first live end-to-end exercise. Live traces across every node in the declaration populate M1–M4 real-world data; operator journal captures MM1 blocker classification; envelope sufficiency is observed or fails at the /subagent-execution stage (highest-risk A4 node).

## Architecture Constraints

- **ADR-013** — every advance calls shared governance package.
- **ADR-phase4-enforcement** — CLI is the mechanism; MCP is for the interactive surface; this cycle exercises CLI only.
- **Spike B2 P2/P4 PARTIAL caveat** — Mode 1 declarative-only constraint envelope; ambient-leak observed-but-not-prevented is logged, not a failure.
- **C7 one question at a time** — per-exchange-mediated nodes (e.g. /clarify) exercise P4 measurement.

## Dependencies

- **Upstream:** v2-install-init, v2-install-sidecar-lockfile, v2-install-collision-detection (install complete on project 1).
- **Upstream:** v2-decl-outer-loop, v2-decl-inner-loop-support (full graph declared).
- **Upstream:** `p4-enf-cli` all 4 ACs DoD (adapter code fleshed and production-ready).
- **Downstream:** v2-e2e-project2, v2-e2e-upgrade, v2-docs-integration-guide (informed by observations).

## Acceptance Criteria

**AC1:** Given project 1 is installed (Epic 1 DoD) and the full workflow graph is declared (Epic 2 DoD), When the operator starts a new feature on project 1 by running `skills-repo advance` from the workflow's entry node (/discovery), Then the CLI builds an envelope and produces a trace entry for the /discovery invocation matching `scripts/trace-schema.json`.

**AC2:** Given the operator completes /discovery on project 1, When they invoke `skills-repo advance` repeatedly through /benefit-metric, /definition, /review, /test-plan, /definition-of-ready, /decisions (if triggered), then through the inner loop to /definition-of-done and /trace, Then every advance produces a trace entry, every trace entry passes `assurance-gate.yml` re-verification on PR, and the feature cycle reaches /definition-of-done without mid-cycle abandonment to chat-native.

**AC3:** Given cycle 1 completes, When the operator inspects the trace output, Then `hash-matching-across-runs%` across identical-content invocations = 100%, `trace-emission%` across advances = 100%, `gate-reverification%` = 100% (M3 targets all met for this single cycle).

**AC4:** Given cycle 1 proceeds, When the operator journals per-node friction, Then CLI-attributable blockers (envelope insufficient, ambient-context needed, command UX confusing) are classified separately from project-specific blockers (unrelated bugs, dependency issues). Total CLI-attributable blocker count for cycle 1 is recorded.

**AC5:** Given cycle 1 completes, When the operator reviews the learnings, Then any observed A4 gaps (envelope did not deliver sufficient context) are logged in `workspace/learnings.md` and, if structural, raised as a /decisions ASSUMPTION entry.

## Out of Scope

- Cycle 2 on project 1 — this story is a single cycle; reruns are operator discretion.
- Full P2 / P4 structural enforcement — Mode 1 PARTIAL caveat accepted; Mode 2 is the closure path and is not exercised here.
- Second project cycle — v2-e2e-project2.
- Upgrade during cycle — v2-e2e-upgrade.
- Cross-runtime trace equivalence — MM2 smoke only in this epic; full test out of MVP.

## NFRs

- **Audit:** Every advance produces a trace; trace chain is verifiable from `/discovery` to `/definition-of-done` without gaps.
- **Correctness:** Cycle completes end-to-end or fails with a traceable diagnosis; no silent abandonment.
- **Performance:** `advance` latency per call (envelope build + hash verify + state advance) < 3 seconds (carried from `p4-enf-cli` NFR).

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — first live end-to-end; envelope sufficiency, agent session quirks, and workflow-declaration edge-cases all surface here.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on Epic 1 + Epic 2 DoD + `p4-enf-cli` DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
