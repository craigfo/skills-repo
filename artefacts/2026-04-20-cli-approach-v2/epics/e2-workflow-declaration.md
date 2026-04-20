## Epic: Full workflow graph declaration authored for usable end-to-end CLI

**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-20-cli-approach-v2/benefit-metric.md`
**Slicing strategy:** Risk-first

## Goal

Every node the operator reaches for during a feature lifecycle is declared in the workflow artefact consumed by the CLI: outer-loop skills (/discovery, /benefit-metric, /definition, /review, /test-plan, /definition-of-ready, /decisions), inner-loop coding sub-steps (/branch-setup, /implementation-plan, /subagent-execution, /verify-completion, /branch-complete), terminating steps (/definition-of-done, /trace), and composed support skills (/workflow, /clarify, /estimate, /checkpoint, /tdd, /systematic-debugging, /implementation-review). Each node carries `allowedTransitions`, optional `expected-output-shape` (JSON Schema), skill hash, and approval-gate metadata per `theme-f-inputs.md §2`. Authoring effort is bounded — proven by splitting outer-loop decomposition from inner-loop + support decomposition so the graph can be validated incrementally before committing to full coverage.

## Out of Scope

- Runtime behaviour of the CLI consuming the declaration — that is `p4-enf-cli` ACs (adapter code).
- Schema evolution beyond current shape (nodes, transitions, expected-output-shape, skill hash, approval-gate metadata) — new field types require a repo-level ADR and are not in MVP.
- Workflow-declaration linting or authoring tooling — out of MVP; manual authoring is the target.
- Customisation semantics (consumer adds/replaces a node) — Epic 5 explores §16.2.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|------------------------|
| M1 — Skill-as-contract (P1) | No graph declared; 0% coverage | Full graph declared; all live nodes have hash-pinned skill references | Every node's skill hash is declared, making P1 measurable across the full lifecycle rather than one phase. |
| M4 — Interaction mediation (P4) | No structural constraint on graph visibility today | Declaration hides graph from agent structurally — envelope delivers only current node's scoped context | Declaration is the structural seam; once authored, the agent never sees the graph. |
| MM1 — Real end-to-end adoption fidelity | No full-lifecycle declaration available | Full graph declared — prerequisite for end-to-end cycles on the two validation projects | Without the full graph, MM1 cannot be measured because the operator cannot complete a feature cycle via the CLI. |
| A5 (assumption validation) — Workflow declarations are authorable and maintainable | Unvalidated | Authoring effort bounded; drift manageable | Demonstrates by incremental completion; if outer-loop authoring cost is too high, reshape the schema before attempting inner loop. |

## Stories in This Epic

- [ ] v2-decl-outer-loop — Outer-loop subgraph declaration (/discovery → /definition-of-ready → /decisions)
- [ ] v2-decl-inner-loop-support — Inner-loop coding + support-skill nodes + back-transitions

## Human Oversight Level

**Oversight:** High
**Rationale:** The workflow declaration is the structural contract between CLI and agent. Authoring errors (wrong `allowedTransitions`, missing skill hash, incorrect `expected-output-shape`) directly break P1 or P4 at runtime. Operator reviews each node before it's pinned.

## Complexity Rating

**Rating:** 3

## Scope Stability

**Stability:** Unstable — schema may need extension as edge-cases surface (back-transitions across epics, approval-gate polymorphism, conditional transitions). Carried as Risk 7 (second maintenance surface) in discovery.
