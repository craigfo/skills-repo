## Epic: Non-fork install with permanent-exclusion-list enforcement on existing repos

**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-20-cli-approach-v2/benefit-metric.md`
**Slicing strategy:** Risk-first

## Goal

A platform operator can install the CLI into an existing project via `skills-repo init` without forking the upstream skills repository. The sidecar directory materialises upstream content (SKILL.md files, POLICY.md files, templates, standards, scripts) and commits a lockfile with hash pins. The permanent-exclusion list (Spike C addendum-1d) is honoured: no writes to `pipeline-state.json`, `.github/context.yml`, `.github/copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `fleet/`, `fleet-state.json`, or `product/**`. `install` generates no commits. `architecture-guardrails.md` managed-merge preserves consumer-authored ADR blocks. The non-fork mechanism is validated against realistic repo structure, not a synthetic scaffold.

## Out of Scope

- CLI adapter code itself — `p4-enf-cli` owns fleshing the 7 stubs and hardening `advance` / `emitTrace`. This epic assumes adapter code is in place (upstream dependency).
- `upgrade` cycle — covered in Epic 3.
- Second project install — Epic 3 (cross-project quirks surface there, not here).
- Sidecar collision recovery beyond pre-install detection — out of MVP; carried as follow-on if observed.
- Operator-facing install documentation — Epic 4.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|------------------------|
| M5 — Non-fork adoption | 0 / 2 projects installed non-fork | 1 / 2 installed (step 1 of 2) | This epic produces the first non-fork install event on an existing realistic repo — the primary M5 validation signal. Epic 3 completes 2/2 on the second project. |
| M3 — Trace anchoring (install-boundary only) | No trace at install boundary | Install event traces emitted per schema | `init` is not a workflow-graph transition, but the install event emits an identity / version record used by downstream `advance` invocations. |

## Stories in This Epic

- [ ] v2-install-init — Install scaffolded CLI honouring permanent-exclusion list on project 1
- [ ] v2-install-sidecar-lockfile — Sidecar materialisation + lockfile commit with hash pins
- [ ] v2-install-collision-detection — Pre-install collision detection and managed-paths enumeration

## Human Oversight Level

**Oversight:** Medium
**Rationale:** Install is mostly deterministic once adapter code is in place. Operator is self-consuming; each install event is observable. Risk is exclusion-list violations on real repos — Medium because a violation means overwritten operator content, not silent data loss. Not High because rollback is a git checkout.

## Complexity Rating

**Rating:** 2

## Scope Stability

**Stability:** Unstable — first contact with realistic repo structures; collisions and quirks will surface.
