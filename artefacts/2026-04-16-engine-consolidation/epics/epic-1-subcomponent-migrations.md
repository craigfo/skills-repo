## Epic: Seven `src/*` subcomponents are authoritative under `cli/`

**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`
**Slicing strategy:** Vertical slice — each subcomponent migration is an independent demoable unit (src + tests + destination scaffolding, ending in a mergeable PR).

## Goal

After this epic, every platform-internal subcomponent today living under `src/` lives under `cli/src/` at its designated destination with its tests co-located. The `src/` directory contains no executable code. No non-`cli/` call sites reference migrated subcomponents by path. The control-plane principle (006) is structurally enforced — what a code change touches is the CLI tree, not a secondary engine location.

## Out of Scope

- **Any behaviour change** to migrated subcomponents. Move-only refactor. New capabilities on a migrated subcomponent live in a separate feature after the move.
- **`.github/scripts/` collapse beyond the two subcomponent-test relocations** in `/clarify` Q3. The broader collapse is deferred to a follow-up feature tied to 005 Gate 4.
- **Publishing a new `skills-repo` npm version.** The CLI already ships v0.1.0-mvp.1; this epic's migration doesn't require a new publish unless a subsequent release decision is made elsewhere.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| M1 migration completeness | 0 of 7 | 7 of 7 | Each story moves one subcomponent end-to-end. |
| M2 pre/post test invariant | Per-story capture at branch-setup | 100% match | Every story's DoD includes the pre/post test snapshot. |
| M4 host-repo cleanliness | 16 `.js` files under `src/` | 0 executable files | Aggregate effect of seven completed migrations. |
| MM1 control-plane principle realised | ≥2 non-`cli/` references today | 0 references | Each story removes its subcomponent's references from outside `cli/`. |
| MM2 parallel approach validated | 0 | ≤1 cross-branch collision | Integration measurement across the seven branches. |
| MM3 Phase 3 no-blocking | 0 | 0 blocking incidents | Each story checks for collisions before opening its PR. |

## Stories in This Epic

- [ ] `ec1.1` — Migrate `src/surface-adapter/` → `cli/src/adapters/surface-adapter/`
- [ ] `ec1.2` — Migrate `src/improvement-agent/` → `cli/src/agents/improvement-agent/`
- [ ] `ec1.3` — Migrate `src/approval-channel/` → `cli/src/adapters/approval-channel/`
- [ ] `ec1.4` — Migrate `src/bitbucket-cloud-validator/` → `cli/src/adapters/bitbucket/cloud/`
- [ ] `ec1.5` — Migrate `src/bitbucket-dc-validator/` → `cli/src/adapters/bitbucket/dc/`
- [ ] `ec1.6` — Migrate `src/suite-parser/` → `cli/src/engine/suite/`
- [ ] `ec1.7` — Migrate `src/definition-skill/` → `cli/src/engine/story/`

## Human Oversight Level

**Oversight:** Medium
**Rationale:** Move-only refactor of production code paths with governance implications (MC-CLI-01 guardrail compliance per migration). Operator reviews each migration PR; the coding agent drives the mechanical work between checkpoints.

## Complexity Rating

**Rating:** 2
**Notes:** Per-subcomponent complexity is 1–2 (mechanical move + test co-location + import updates). The epic-level 2 reflects coordination across 7 parallel branches.

## Scope Stability

**Stability:** Stable

## Integration notes

- Each story opens on its own branch off `develop` (per `outputs/008`).
- All seven may be opened concurrently (Q1 parallel migration decision).
- Integration happens when each PR merges back into `develop` individually.
- If a cross-branch collision surfaces during the integration sequence, MM2's min signal absorbs up to one collision; beyond that, the parallel approach is re-evaluated for future features (not this one — this one completes even if sequential was needed mid-way).
