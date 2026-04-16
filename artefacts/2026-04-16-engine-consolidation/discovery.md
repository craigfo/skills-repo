# Discovery: Engine consolidation + formal contributions model

**Status:** Clarified — ready for `/benefit-metric`. Speculatively proceeding on develop without waiting on upstream alignment of the 006 proposal (PR open, unreviewed).
**Created:** 2026-04-16
**Clarified:** 2026-04-16 (see Clarification log at end)
**Author:** Claude (operator-driven)
**Feature slug:** 2026-04-16-engine-consolidation
**Primary reference:** [`reference/006-engine-consolidation-proposal.md`](./reference/006-engine-consolidation-proposal.md)

> Discovery was initially opened as a partial / direction-setting artefact to accompany the cross-fork PR to heymishy/skills-repo. `/clarify` (2026-04-16) has now sharpened the scope to seven concrete src/* migration subcomponents on a parallel-branch plan; `.github/scripts/` collapse deferred to a follow-up feature. Work continues on develop in parallel with the unreviewed upstream PR.

---

## Problem Statement

Two engine implementations are diverging inside this repository:

- **`src/`** — the platform-internal engine inherited from the clone-model era: `surface-adapter/`, `improvement-agent/`, `approval-channel/`, Bitbucket validators. Invoked by `.github/scripts/` and `.github/workflows/`. Designed assuming the engine lives inside the consumer's repo.
- **`cli/`** — the consumer-facing engine shipped by the productisation thread (MVP 2026-04-15): `cli/src/engine/fetch.ts`, `lock.ts`, `workflow.ts`, `trace.ts`. Distributed as an installable npm package. Designed assuming the engine lives outside the consumer's repo.

Shared primitives — hash verification, lockfile schema, fetch, trace schema — have started to duplicate. The third copy (inevitable when `verify --ci` lands as the real assurance gate per `outputs/005-mvp-cli-honest-retrospective.md` Gate 4) scales the reconciliation cost super-linearly.

Separately, there is no documented contributions model. Two active contributors (one on Phase 3 in `src/`, one on the productisation thread in `cli/`) coordinate ad-hoc. Scope ownership, proposal process, in-flight signalling, and review expectations are all tribal.

---

## Who It Affects

- **Contributors** — both active, plus any third contributor the absence of a model would currently exclude.
- **Future adopters** — who should not have to care which engine lives where.
- **Platform maintainers** — facing a fork-in-the-road between letting divergence grow and a structured consolidation.

---

## Why Now

- The fork is fresh. Every feature added on either side widens the delta.
- Exactly two contributors today: cheapest possible time to agree a contributions model and a consolidation direction. At three it breaks.
- The next productisation gate (real CI assurance gate, Gate 4 in 005) would land the third copy of hash verification. Consolidating first means Gate 4 imports from `packages/engine/`, not duplicates.

---

## MVP Scope

Per the proposal (006), the work flows from one principle: **the CLI is the trusted control plane; the AI agent only operates within CLI-defined bounds.** Everything structural moves into `cli/`.

1. **Promote `src/*` contents into `cli/`.** Seven subcomponents; each moves with its tests.

   | Subcomponent | Src LOC | Destination | Tests (move together) | Test LOC |
   |---|---:|---|---|---:|
   | `src/surface-adapter/` | 1,471 | `cli/src/adapters/surface-adapter/` | `.github/scripts/check-surface-adapter.js` | 1,732 |
   | `src/improvement-agent/` | 2,351 | `cli/src/agents/improvement-agent/` | `tests/check-improvement-agent.js`, `tests/check-challenger.js`, `tests/failure-detector.*.test.js` | 2,970 |
   | `src/approval-channel/` | 260 | `cli/src/adapters/approval-channel/` | `tests/check-dor-approval.js` | 630 |
   | `src/bitbucket-cloud-validator/` | 302 | `cli/src/adapters/bitbucket/cloud/` | `tests/check-bitbucket-cloud.js` | 319 |
   | `src/bitbucket-dc-validator/` | 475 | `cli/src/adapters/bitbucket/dc/` | `tests/check-bitbucket-dc.js`, `tests/check-bitbucket-dc-auth.test.js` | 571 |
   | `src/suite-parser/` | 197 | `cli/src/engine/suite/` | `.github/scripts/check-suite.js` | 514 |
   | `src/definition-skill/` | 143 | `cli/src/engine/story/` | `tests/check-definition-skill*.js` | 403 |

   Shared primitives (hash, fetch, lockfile, trace, workflow) already in `cli/src/engine/`; stay there. `cli/` becomes the single authoritative home for structural code. **Move-only** — no behaviour change per subcomponent. **Tests move with their source.**

   **Migration approach: parallel.** Each subcomponent migrates on its own branch, independently; all branches opened concurrently rather than sequentially. At solo scale, throughput beats sequential learning, and subcomponents are structurally independent enough that collisions across branches are rare. Risk accepted: if the move-only pattern has a latent flaw, all branches inherit it before any one of them catches it — mitigated by running each subcomponent's existing tests before and after its move on its own branch (see R.2).

   **Pre/post test invariant (per subcomponent):** snapshot test count + pass rate before the move; after the move the counts and pass rates must match exactly. Any drift is a test failure.

2. **Subcomponent tests that currently live in `.github/scripts/` move with their subcomponent.** Two scripts identified — `check-surface-adapter.js` → with `surface-adapter/`, `check-suite.js` → with `suite-parser/`. These are tests, not governance scripts, and the pre/post invariant in item 1 requires them to travel with the code they test. No broader `.github/scripts/` work in this feature.
3. **`CONTRIBUTING.md`** at repo root — scope ownership (CODEOWNERS-shaped), proposal process for `product/*` (the 006 RFC flow is the reference implementation), in-flight-work signalling convention.
4. **`product/*` edits** — roadmap appended with the Productisation thread; tech-stack amended with the new engine layout (single `cli/` home; `src/` deprecated); new ADR in `product/decisions.md` recording the control-plane framing.

No behaviour change externally. Structural refactor + governance document. One npm package (`skills-repo`), one version, one published artefact. No monorepo.

---

## Out of Scope (mandatory)

- **Cross-repo split** (moving `cli/` to a separate GitHub repo). Rejected as over-engineering for two contributors.
- **Monorepo tooling** (`npm workspaces` / `pnpm`). Not needed — one package, one version, one published artefact.
- **Behaviour changes to any migrated component.** Move-only refactor. Any functional change to surface-adapter / improvement-agent / approval-channel / bitbucket validators lands as its own feature *after* the move, through the normal outer loop.
- **Changes to SKILL.md or standards content.** Governed by the existing C4 human-approval gate; not touched here.
- **Collapsing `.github/scripts/` at large.** Originally item 2 in MVP scope; removed on 2026-04-16 during `/clarify`. The 14 remaining scripts beyond the two that move with their subcomponent (item 2) require per-script classification (CLI-logic duplicator vs hygiene validator) that needs deeper investigation than this feature supports. Deferred to a **separate future feature** (`2026-04-NN-github-scripts-collapse`, TBD) that naturally ties to 005 Gate 4 (real CI assurance gate), since that's what the CLI-logic-duplicator category ultimately gets replaced by.
- **Any changes to `check-docs-structure.js`, `check-pipeline-artefact-paths.js`, `check-changelog-readme.js`, or other hygiene validators.** Unchanged by this feature; the deferred follow-up may confirm them as hygiene or reclassify.
- **The LLM-bridge work** (005 Gate 3). Different feature; will reference the new `cli/` layout once it exists.
- **Renaming `cli/`** to something less misleading once it holds adapters + agents + engine. Cosmetic; not this feature.

---

## Assumptions and Risks

- **A.1** — The Phase 3 contributor agrees with the **control-plane principle** (CLI is structural authority; AI operates within CLI-defined bounds), not just the refactor. If they disagree with the principle, this feature closes and the divergence is re-scoped.
- **A.2** — `src/*` subcomponents can be moved into `cli/src/` without material behaviour change. Public interfaces of each subcomponent are preserved; imports adjust; existing tests retained before and after.
- **A.3** — Phase 3 in-flight work on `src/*` or `.github/scripts/` is coordinatable. Either it merges before this starts, or this starts after. No parallel work on the same files.
- **R.1** (critical) — Mid-refactor collision with Phase 3 work if sequencing isn't respected. Mitigation: direct coordination before any migration commit; `CONTRIBUTING.md` WIP-issue convention lands first so future occurrences are structurally avoided.
- **R.2** — Moving code from `src/` to `cli/` may expose previously-implicit coupling (e.g. improvement-agent assuming a path layout). Mitigation: each subcomponent's existing tests run before and after its move on its own branch; drift shows up as a test failure (note: moves happen in parallel per item 1, so each branch's pre/post comparison is independent).
- **R.3** (deferred with the `.github/scripts/` collapse — no longer in this feature's risk set).

---

## Directional Success Indicators

- Hash-verification logic exists once, called from at least two call sites (`cli/` + `.github/scripts/`).
- Lockfile schema is defined once.
- A new contributor onboarding to the repo can read `CONTRIBUTING.md` and know who owns what without asking.
- 005 Gate 4 (CI assurance gate) ships importing from `packages/engine/`, not duplicating.
- No behaviour regression detected: existing `npm test` on both sides passes unchanged; dogfood script still passes; Phase 3 governance suite (23 tests) still passes.

---

## Constraints

- **C4** (inherited) — no change to SKILL.md / POLICY.md / standards content without human approval. Not affected by this work; engine code only.
- **C13** (inherited, *applied concretely*) — *"structural governance preferred over instructional."* This feature is that principle stated sharply: **the CLI is the structural boundary**; agents operate within bounds the CLI enforces, not bounds a SKILL.md merely advises. A documented seam (ARCHITECTURE.md pointing at the divergence) doesn't satisfy C13 — the CLI has to actually *be* the single authority.
- **E.1** — Must not block or damage Phase 3's in-flight implementation work. Coordination is the operating mode. The cross-fork PR is the standing alignment surface; if the Phase 3 contributor signals a collision, migration of the affected subcomponent pauses until they merge.
- **E.2** — Move-only for all migrated subcomponents. Any behaviour change is a separate feature, run through the normal outer loop.

---

## Next step

`/benefit-metric` — define measurable outcomes for the seven-subcomponent migration. The cross-fork PR to heymishy is running in parallel; alignment on the 006 principle is a separate concern tracked via PR comments, not a blocker for downstream skills on this feature (speculatively building on develop).

---

## Clarification log

2026-04-16 — clarified via `/clarify`:

- **Q1 — Migration ordering?** A: **parallel**, not sequential. Each of the 7 subcomponents migrates on its own branch, opened concurrently. Risk accepted: if the move-only pattern has a latent flaw, all branches inherit it before detection. Mitigated by per-branch pre/post test-count + pass-rate invariant. *Changes: MVP Scope item 1 — "Migration approach: parallel" paragraph added.*
- **Q2 — Test coverage per subcomponent?** A: **inspected.** All 7 subcomponents have adequate-to-strong coverage (ratios 1.06–2.82). Tests are split across `tests/` and `.github/scripts/`; they move with their source. `surface-adapter`'s and `suite-parser`'s tests live under `.github/scripts/` — these two test files move too. *Changes: MVP Scope item 1 gains a full 7-row table with src LOC, destination, test file locations, test LOC. Added pre/post test-count invariant.*
- **Q3 — `.github/scripts/` classification?** A: **narrow the feature.** Per-script classification (CLI-logic duplicator vs hygiene validator) requires deeper per-script understanding than this feature supports. Two scripts move with their subcomponent (from Q2). The broader collapse is deferred to a separate future feature that naturally ties to 005 Gate 4. *Changes: MVP Scope item 2 narrowed to "the 2 subcomponent-tests that move"; broader collapse added to Out of Scope with a forward reference.*
- **Q4 — `src/definition-skill/` placement?** A: **engine-level utility**, not definition-skill-specific. The 6 exported functions are pure-ish story-format validators (dependency-chain / testability heuristics / annotation format-checks) consumed by multiple skills over the lifecycle. Destination: `cli/src/engine/story/` rather than `cli/src/agents/definition-skill/`. *Changes: migration table row for `src/definition-skill/` destination updated.*

Scope outcome: MVP retained at 4 items; src/* migration list refined from 4 named components to 7 concrete ones with destinations, test-colocation rule, and parallel-branch approach.
