## Story: Inner-loop coding sub-step and support-skill nodes declared — full workflow graph complete

**Epic reference:** `../epics/e2-workflow-declaration.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want to **extend the workflow declaration to cover the inner-loop coding sub-steps (/branch-setup, /implementation-plan, /subagent-execution, /verify-completion, /branch-complete), the terminating steps (/definition-of-done, /trace), and composed support skills (/workflow, /clarify, /estimate, /checkpoint, /tdd, /systematic-debugging, /implementation-review)**,
So that **the operator reaches *every* pipeline node via the CLI, not just outer-loop ones — the full-graph MVP scope (Q1 SCOPE decision) is realised**.

## Benefit Linkage

**Metric moved:** M1 / M2 / M3 / M4 — full-graph coverage makes per-invocation fidelity measurable across the complete feature lifecycle. A5 assumption — authoring at full scope validates or invalidates.
**How:** The outer-loop declaration (v2-decl-outer-loop) covers ~7 nodes; this story adds ~12 more, completing the ~19-node graph from discovery MVP. Without this, the operator hits a declaration gap during the inner loop and has to abandon the CLI mid-feature — breaking M2 and MM1.

## Architecture Constraints

- **ADR-013** — same shared-package contract applies across all nodes.
- **ADR-004** — declaration file path config continues from context.yml.
- **`theme-f-inputs.md §2`** — schema still authoritative; back-transitions and conditional transitions may stretch the schema; stretches land here and surface schema-iteration needs.
- **C7 one question at a time** — inner-loop /subagent-execution and support skills (/clarify) have conversational patterns; their node declarations carry `per_exchange_mediation: true` metadata.

## Dependencies

- **Upstream:** v2-decl-outer-loop (declaration artefact exists with outer-loop nodes; this story extends it).
- **Downstream:** All Epic 3 stories (full cycles require full graph).

## Acceptance Criteria

**AC1:** Given v2-decl-outer-loop is DoD, When this story completes, Then the declaration additionally contains nodes: `branch-setup`, `implementation-plan`, `subagent-execution`, `verify-completion`, `branch-complete`, `definition-of-done`, `trace`, `workflow`, `clarify`, `estimate`, `checkpoint`, `tdd`, `systematic-debugging`, `implementation-review` — 14 additional nodes for ~21 total.

**AC2:** Given the inner-loop coding sub-steps are declared, When transitions are inspected, Then `/branch-setup` → `/implementation-plan` → `/subagent-execution` → `/verify-completion` → `/branch-complete` form a linear inner-loop path; back-transitions from `/verify-completion` → `/implementation-plan` (when verification fails) are declared explicitly.

**AC3:** Given support skills are declared, When their transitions are inspected, Then `/workflow`, `/clarify`, `/estimate`, and `/checkpoint` have entry-from-any-node semantics (declared as `callable_from: "any"` or equivalent) — the operator can invoke them from any current node state without a transition sequence.

**AC4:** Given the full declaration exists, When `skills-repo verify --declaration` is run, Then it reports zero orphaned transitions (every target exists), zero unused nodes (every node is reachable from `/discovery`), and zero skill-hash mismatches across all declared nodes.

**AC5:** Given the declaration is complete, When its size or structural complexity is reviewed, Then authoring burden is logged in `workspace/learnings.md` as either "bounded — A5 validated" or "unbounded — A5 invalidated, reshape schema" — the authoring-burden signal is explicit.

## Out of Scope

- Skill-specific behavioural overrides via declaration (e.g. "in this node, use a different envelope shape") — not an MVP feature.
- Multi-feature-spanning declarations — each feature has its own declaration; cross-feature composition is out of scope.
- Authoring tooling (validator CLI beyond `skills-repo verify`) — not in MVP.

## NFRs

- **Correctness:** All transition edges are verifiable; schema validation is mandatory pre-commit.
- **Audit:** Schema iteration decisions (if any) must be logged in decisions.md as ARCH entries.

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — back-transitions and "any" semantics for support skills stretch the schema; genuinely experimental territory.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on v2-decl-outer-loop DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
