## Story: Outer-loop subgraph declaration authored for /discovery through /definition-of-ready

**Epic reference:** `../epics/e2-workflow-declaration.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want to **have a workflow declaration covering every outer-loop skill node (/discovery, /benefit-metric, /definition, /review, /test-plan, /definition-of-ready, /decisions)**,
So that **the CLI can drive the outer loop end-to-end and P1/P4 are measurable across real feature-initiation cycles, not a single-step demonstrator**.

## Benefit Linkage

**Metric moved:** M1 (P1 skill-as-contract), M4 (P4 interaction mediation), A5 (workflow declarations are authorable).
**How:** The declaration is the structural contract. Every outer-loop node's `allowedTransitions` + `expected-output-shape` + skill hash is the mechanism by which P1 (hash match) and P4 (agent never sees graph) are enforced. Without the declaration, these metrics have nothing to measure against.

## Architecture Constraints

- **ADR-013** — declaration is consumed by the shared governance package; schema aligns with what `governance-package.js` reads.
- **ADR-phase4-enforcement** — mechanism selection applies at runtime; declaration is mechanism-agnostic.
- **ADR-004** — declaration file path is set in `.github/context.yml` (`skills_upstream.workflow_declaration`).
- **Feature-decision Q5 (carried from 2026-04-18 ADR-003)** — verification contract lives inside the declaration as per-node fields, not a separate `verify-contract.json`.
- **`theme-f-inputs.md §2`** — declaration structure (nodes[], allowedTransitions, expected-output-shape) is authoritative.

## Dependencies

- **Upstream:** None — declaration schema is stable (theme-f-inputs.md §2); skill files exist in the upstream skills repo.
- **Downstream:** v2-decl-inner-loop-support (continues the declaration); all Epic 3 stories consume the declaration for end-to-end runs.

## Acceptance Criteria

**AC1:** Given the workflow declaration artefact is created at the path configured in `skills_upstream.workflow_declaration`, When the operator opens it, Then it contains 7 nodes: `discovery`, `benefit-metric`, `definition`, `review`, `test-plan`, `definition-of-ready`, `decisions`, each with an `id` field matching the list.

**AC2:** Given the declaration is authored, When each outer-loop node is inspected, Then it declares `allowedTransitions` as a non-empty array referencing only other declared node IDs (or the special `terminal` / back-references as designed); no dangling transitions.

**AC3:** Given the declaration is authored, When each outer-loop node's `expected-output-shape` field is inspected, Then nodes producing structured output (e.g. `definition` produces an epics-plus-stories count) have a JSON Schema; nodes producing free-form markdown artefacts (e.g. `discovery`, `benefit-metric`) have `expected-output-shape: null` with a comment explaining why (AC3 of `p4-enf-schema` permits null).

**AC4:** Given the declaration references skill hashes, When each node's `skill_hash` field is inspected, Then it matches the SHA-256 of the corresponding SKILL.md content currently pinned in the sidecar's lockfile — `skills-repo verify --declaration` confirms zero mismatches across all 7 nodes.

**AC5:** Given nodes declare approval-gate metadata (for example, `/review` gate to proceed; `/definition-of-ready` sign-off gate), When the declaration is inspected, Then each gate node has an `approval_gate` object naming the gate type (per ADR-006 channel-adapter pattern) and the expected approver role.

## Out of Scope

- Inner-loop coding sub-step nodes — v2-decl-inner-loop-support.
- Support-skill nodes (/workflow, /clarify, /estimate, /checkpoint) — v2-decl-inner-loop-support.
- Back-transitions across epics in the outer loop (e.g. /review back to /definition) — they may be declared here if simple; complex multi-back semantics deferred.
- Customisation — Epic 5.

## NFRs

- **Correctness:** Every declared node references a skill that exists in the upstream skills repo's `.github/skills/` directory at the pinned lockfile ref. Orphan references are a failure.
- **Schema:** Declaration validates against the JSON schema documented in `theme-f-inputs.md §2`.
- **Audit:** Declaration file is hash-pinned in the lockfile (declaration changes trigger a lockfile update).

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — first full-scope declaration authoring; edge-cases (missing `expected-output-shape` for skills producing prose, back-transition grammar) may require schema iteration.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
