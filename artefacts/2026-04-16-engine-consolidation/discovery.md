# Discovery: Engine consolidation + formal contributions model

**Status:** Draft — partial discovery. Direction-setting only. Outer loop not completed.
**Created:** 2026-04-16
**Author:** Claude (operator-driven)
**Feature slug:** 2026-04-16-engine-consolidation
**Primary reference:** [`reference/006-engine-consolidation-proposal.md`](./reference/006-engine-consolidation-proposal.md)

> This discovery is intentionally partial. It exists so reviewers of the upstream PR can see the direction we propose *before* any migration work begins. `/clarify`, `/benefit-metric`, `/definition`, and downstream skills run only after alignment on the direction. See the reference proposal for the full RFC.

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

1. **Promote `src/*` contents into `cli/`.**
   - `src/surface-adapter/` → `cli/src/adapters/`
   - `src/improvement-agent/` → `cli/src/agents/improvement-agent/`
   - `src/approval-channel/` → `cli/src/adapters/approval-channel/`
   - Bitbucket validators → `cli/src/adapters/bitbucket/`
   - Shared primitives (hash, fetch, lockfile, trace) already in `cli/src/engine/`; stay there.
   `cli/` becomes the single authoritative home for structural code. Move-only — no behaviour change.
2. **Collapse `.github/scripts/` duplication.** Scripts that re-implement CLI logic (hash verification, state-schema validation, trace transitions) get replaced by `skills-repo verify` / `skills-repo improve` invocations from GitHub Actions. Hygiene-only validators (docs structure, artefact-path linting) stay.
3. **`CONTRIBUTING.md`** at repo root — scope ownership (CODEOWNERS-shaped), proposal process for `product/*` (the 006 RFC flow is the reference implementation), in-flight-work signalling convention.
4. **`product/*` edits** — roadmap appended with the Productisation thread; tech-stack amended with the new engine layout (single `cli/` home; `src/` deprecated); new ADR in `product/decisions.md` recording the control-plane framing.

No behaviour change externally. Structural refactor + governance document. One npm package (`skills-repo`), one version, one published artefact. No monorepo.

---

## Out of Scope (mandatory)

- **Cross-repo split** (moving `cli/` to a separate GitHub repo). Rejected as over-engineering for two contributors.
- **Monorepo tooling** (`npm workspaces` / `pnpm`). Not needed — one package, one version, one published artefact.
- **Behaviour changes to any migrated component.** Move-only refactor. Any functional change to surface-adapter / improvement-agent / approval-channel / bitbucket validators lands as its own feature *after* the move, through the normal outer loop.
- **Changes to SKILL.md or standards content.** Governed by the existing C4 human-approval gate; not touched here.
- **Deleting hygiene-only `.github/scripts/`** (e.g. `check-docs-structure.js`, `check-pipeline-artefact-paths.js`). Different concern — they're not duplicating CLI logic.
- **The LLM-bridge work** (005 Gate 3). Different feature; will reference the new `cli/` layout once it exists.
- **Renaming `cli/`** to something less misleading once it holds adapters + agents + engine. Cosmetic; not this feature.

---

## Assumptions and Risks

- **A.1** — The Phase 3 contributor agrees with the **control-plane principle** (CLI is structural authority; AI operates within CLI-defined bounds), not just the refactor. If they disagree with the principle, this feature closes and the divergence is re-scoped.
- **A.2** — `src/*` subcomponents can be moved into `cli/src/` without material behaviour change. Public interfaces of each subcomponent are preserved; imports adjust; existing tests retained before and after.
- **A.3** — Phase 3 in-flight work on `src/*` or `.github/scripts/` is coordinatable. Either it merges before this starts, or this starts after. No parallel work on the same files.
- **R.1** (critical) — Mid-refactor collision with Phase 3 work if sequencing isn't respected. Mitigation: direct coordination before any migration commit; `CONTRIBUTING.md` WIP-issue convention lands first so future occurrences are structurally avoided.
- **R.2** — Moving code from `src/` to `cli/` may expose previously-implicit coupling (e.g. improvement-agent assuming a path layout). Mitigation: one subcomponent at a time; each subcomponent's existing tests run before and after the move; drift shows up as a test failure.
- **R.3** — Existing `.github/scripts/` replaced by CLI invocations may have subtle behaviour (exit codes, stderr format) that downstream workflows rely on. Mitigation: replace-then-verify; don't delete a script until the workflow it supports has been switched over and proven.

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
- **E.1** — Must not block or damage Phase 3's in-flight implementation work. Sequencing (not parallel) is the operating mode. This partial discovery is opened as a cross-fork PR specifically so the Phase 3 contributor can veto, defer, or align on sequencing before any migration commit lands.
- **E.2** — Move-only for all migrated subcomponents. Any behaviour change is a separate feature, run through the normal outer loop.

---

## Next step

Awaiting alignment via the cross-fork PR that accompanies this discovery. If accepted: run `/clarify` → `/benefit-metric` → `/definition` on this feature folder. If rejected or deferred: close the feature; revisit when the context changes.
