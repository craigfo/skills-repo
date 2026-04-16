# Proposal: CLI as the single authoritative control plane + formalised contributions model

**Author:** [operator]
**Status:** Draft — awaiting review
**Date:** 2026-04-16

---

## Summary

Two related changes to `product/*`, driven by a single principle.

**Principle:** the CLI is the trusted control plane; the AI agent only operates within CLI-defined bounds. Skills-repo's `constraints.md` C13 already names this (*"structural governance preferred over instructional"*) — this proposal makes it concrete.

Changes:

1. **Promote `src/*` into `cli/`.** All platform-internal components (`surface-adapter/`, `improvement-agent/`, `approval-channel/`, Bitbucket validators) move into `cli/src/adapters/` and `cli/src/agents/`. `cli/` becomes the single authoritative home for structural code. `.github/scripts/` scripts that duplicate CLI logic are replaced by `skills-repo verify` / `skills-repo improve` invocations. No monorepo — one package, one version, one published artefact (`skills-repo`).
2. **Formalise a contributions model.** Today there is no documented mechanism for multiple contributors to coordinate. Scope ownership, change proposal, review expectations, and in-flight-work signalling are all ad-hoc. `CONTRIBUTING.md` at repo root — this very proposal (the Option-B RFC flow) is the reference implementation.

Both changes are docs/structural; neither changes shipped behaviour on its own. Move-only refactor for migrated code — any functional change to a subcomponent lands as its own feature *after* the move.

---

## Motivation

### Part 1 — Divergence without a control-plane principle

Two engine implementations inside the repo today:

- `src/surface-adapter/`, `src/improvement-agent/`, `src/approval-channel/`, `src/bitbucket-*/` — platform-internal components invoked by `.github/scripts/` and `.github/workflows/`. Designed on the clone-model assumption: the engine lives inside the consumer's repo and is called by platform-side scripts.
- `cli/src/engine/` (shipped 2026-04-15) — consumer-facing distribution. Lives in an installable npm package. Designed on the sidecar model: the engine lives outside the consumer's repo.

Overlap is real and growing:

| Concern | In `src/…` | In `cli/src/engine/…` |
|---|---|---|
| Hash verification | `.github/scripts/run-assurance-gate.js` (planned) | `cli/src/engine/lock.ts` (shipped) |
| Fetch / resolve skill content | `src/surface-adapter/` | `cli/src/engine/fetch.ts` |
| Lockfile schema | — (not yet) | `cli/src/engine/lock.ts` |
| Trace schema | `.github/scripts/` + `workspace/traces/*.jsonl` shape | `cli/src/engine/trace.ts` |

Gate 4 in `outputs/005-mvp-cli-honest-retrospective.md` — the real CI assurance gate — would, if implemented in `.github/workflows/` using the `src/` style, write hash-verification logic a third time. The reconciliation cost scales super-linearly with both sides' surface area.

But the deeper issue is not duplication: it's that **platform-internal code in `src/` invoked by hand-rolled scripts means the agent is operating through surfaces that aren't CLI-bounded**. Structural governance (C13) requires the CLI to actually *be* the authority, not just one implementation among several.

### Part 2 — No contributions model

Two active contributors: one on `src/` and upstream Phase 3 artefacts; one (operator + agent) on `cli/` and the productisation thread. There is:

- No file-level ownership or CODEOWNERS mapping.
- No mechanism for signalling "I'm about to modify X — please hold on related changes."
- No documented convention for when a `product/*` change should happen (this proposal is testing one).
- No review expectations: who signs off on what? Is it optional?
- No branching or release conventions beyond what's in git commit messages.

At one contributor this is fine. At two it's borderline. At three it breaks.

---

## Proposal

### Part 1 — The CLI as structural control plane

**Principle stated concretely.** Anything that must be deterministic and non-negotiable lives inside the CLI. The agent writes content; the CLI writes rails.

**Concretely:**

- **`cli/` becomes the single authoritative home for structural code.** `src/*` contents migrate in:
  - `src/surface-adapter/` → `cli/src/adapters/`
  - `src/improvement-agent/` → `cli/src/agents/improvement-agent/`
  - `src/approval-channel/` → `cli/src/adapters/approval-channel/`
  - `src/bitbucket-*` → `cli/src/adapters/bitbucket/`
  - Shared primitives (hash, fetch, lockfile, trace) already sit in `cli/src/engine/` and stay there.
- **`.github/scripts/` collapses.** Scripts that re-implement CLI logic (hash verification, state-schema validation, trace transitions) are replaced by `skills-repo verify` / `skills-repo improve` invocations from GitHub Actions. Hygiene-only validators (docs structure, artefact-path linting) stay.
- **One npm package**, one version, one published artefact: `skills-repo`. No monorepo, no separate packages, no workspaces tooling. The semantic separation between "CLI command", "engine primitive", "adapter", and "agent" is expressed as subfolders (`cli/src/commands/`, `cli/src/engine/`, `cli/src/adapters/`, `cli/src/agents/`) — packaging not required.

**Why not a monorepo.** Splits solve a problem we don't have: no component is reused outside skills-repo, no component has a different release cadence, no component has a different toolchain.

**Why move everything rather than deprecate in place.** Otherwise the control-plane principle is stated but not enforced. A component that lives in `src/` and is invoked by `.github/scripts/` is still operating outside the CLI boundary. Partial deprecation leaves the thesis half-implemented.

**Why move-only.** The point is structural homing, not rewriting. Any functional change to moved code becomes its own feature *after* the move, run through the normal outer loop.

**End-state.** A single authoritative engine. Consumers install one npm package. Contributors edit one tree. Auditors read one codebase. `.github/` holds workflows that *invoke* the CLI, not parallel implementations of what the CLI does.

### Part 2 — Contributions model

Add `CONTRIBUTING.md` at repo root covering:

- **Scope ownership.** Minimal CODEOWNERS:
  - `standards/`, `artefacts/2026-04-14-skills-platform-phase3/` → Phase 3 contributor (primary area).
  - `cli/` (the single authoritative engine), `artefacts/2026-04-15-productise-cli-and-sidecar/`, `artefacts/2026-04-16-engine-consolidation/` → productisation contributor.
  - `.github/workflows/`, `.github/scripts/` (hygiene-only) → shared with cross-review; they *invoke* the CLI, not bypass it.
  - `product/*`, `CONTRIBUTING.md`, top-level README/QUICKSTART → shared; require cross-review.
  - `src/` (deprecated) → nobody should be adding code here; existing code migrates into `cli/` per this feature.
- **Proposing changes to `product/*`.** Standalone markdown at `artefacts/<YYYY-MM-DD>-<slug>/reference/` first (or under the active feature folder if one fits); `product/*` edits in a follow-up PR after alignment. This proposal is the reference implementation.
- **Proposing changes to `standards/*` or `SKILL.md` files.** Continue to use the skills-repo pipeline (outer loop + DoR) — these are instruction-set changes and fall under the existing C4 human-approval gate.
- **Code changes under scope ownership.** Owner proposes via PR; the other contributor's review is encouraged but not required unless the PR touches a shared file.
- **Branching + release.** `feature/*` branches; direct-to-master merge acceptable for solo work today; PR gate once Gate 4 (real CI assurance gate) ships. Document explicitly so it's not tribal.
- **In-flight-work signalling.** Open a GitHub issue titled `WIP: <area>` when starting non-trivial work under shared scope; close when merged. Prevents mid-refactor collisions.

---

## Proposed `product/*` edits

Once aligned, land these in a second PR:

### `product/roadmap.md` (append)

```markdown
## Productisation thread (started 2026-04-15)

Orthogonal to the numbered phases. Closes the Phase 1–2 distribution outcome
("at least two squads can consume skills without forking") via an installable
CLI + sidecar model. MVP shipped 2026-04-15
(see `artefacts/2026-04-15-productise-cli-and-sidecar/`). ~8–10 hours of gate
work remain to reach production per `outputs/005-mvp-cli-honest-retrospective.md`:
publish, preset-as-data, LLM bridge, real CI gate, external-adopter pass,
upgrade command. Near-term structural move: CLI as the single authoritative
control plane — see `artefacts/2026-04-16-engine-consolidation/`.
```

### `product/tech-stack.md` (amend Repository structure section)

```markdown
## Engine layout (post-consolidation target)

cli/                      # single authoritative engine — commands, engine,
                          #   adapters, agents. Published as `skills-repo` on npm.
├── src/commands/         # init, status, run next, artefact new, mark-step-done
├── src/engine/           # fetch, lock, workflow, trace (structural primitives)
├── src/adapters/         # surface, approval-channel, bitbucket — delivery-surface bridges
└── src/agents/           # improvement-agent — LLM-role orchestration owned by the CLI
.github/workflows/        # CI — invokes `skills-repo verify` / `skills-repo improve`
.github/scripts/          # repo-hygiene validators only (docs structure, artefact
                          #   paths) — NOT parallel implementations of CLI logic
src/                      # DEPRECATED — contents migrated into cli/; kept as an
                          #   empty directory until the next release cycle then removed
```

### `product/decisions.md` (append ADR)

```markdown
### ADR-00X: CLI is the single authoritative control plane

**Status:** Accepted
**Date:** 2026-04-1X
**Decided by:** [operator, Phase 3 contributor]

#### Context
Two engine implementations emerged as the productisation thread shipped
alongside ongoing Phase 3 work. `src/` held platform-internal code invoked
by `.github/scripts/`; `cli/` held the consumer-facing engine. Shared
primitives started to duplicate; more importantly, the agent was operating
through surfaces that weren't CLI-bounded — violating C13 in practice.

#### Options considered
| Option | Pros | Cons |
|--------|------|------|
| Leave divergence, document the seam in ARCHITECTURE.md | Zero refactor | Documented ≠ enforced; C13 half-implemented |
| Shared packages/engine/ monorepo | Some deduplication | Monorepo tooling without solving a real splitting problem; still leaves src/ invoked outside CLI |
| CLI as single authoritative control plane (chosen) | C13 enforced structurally; single codebase; single published artefact; agent operates only within CLI-defined bounds | Biggest one-time migration; coordination with Phase 3 work critical |

#### Decision
All `src/*` platform-internal components migrate into `cli/src/adapters/`
and `cli/src/agents/`. Shared primitives stay in `cli/src/engine/`.
`.github/scripts/` that duplicate CLI logic are replaced by CLI invocations.
One npm package (`skills-repo`), one version, one published artefact.
No monorepo. Move-only for migrated code — behaviour changes are separate
features.

#### Consequences
Easier: single codebase to reason about; single place to fix bugs;
single surface for auditors.
Harder: one-time migration requiring coordination with Phase 3 work.
Off the table: independent engine evolution between cli/ and .github/scripts/;
platform-side code invoked by scripts outside the CLI boundary;
instructional-only governance where a SKILL.md merely advises and the agent
can ignore it.

#### Revisit trigger
If the CLI's scope grows to the point where its folder name (`cli/`) becomes
materially misleading, rename — cosmetic follow-up. If a component
legitimately needs independent release cadence (not the case for any
currently-identified subcomponent), reconsider packaging then.
```

### New file: `CONTRIBUTING.md` (root)

Shape described in Part 2. Written as an actual file once aligned.

---

## Alternatives considered

1. **Leave divergence alone; document the seam in `ARCHITECTURE.md`.** Cheapest. Rejected on two grounds: (a) the other contributor is actively working on `src/` while we're working on `cli/` — no action = divergence grows; (b) a documented seam doesn't enforce the control-plane principle. Structural governance (C13) requires the CLI to actually *be* the single authority.
2. **Shared `packages/engine/` monorepo with `src/` staying put.** Some deduplication; leaves `src/` invoked outside the CLI. Rejected because it solves the duplication problem without solving the control-plane problem. The thesis only lands when `src/` is absorbed.
3. **Cross-repo split: move `cli/` to a separate GitHub repo.** Would eliminate in-repo divergence but creates cross-repo coordination overhead. Rejected as over-engineering for two contributors.

---

## Open questions

- **Sequencing:** should engine consolidation land *before* Gate 4 (real CI assurance gate) so Gate 4 invokes `skills-repo verify` from Actions rather than a hand-rolled script? Proposal assumes yes.
- **Subcomponent interfaces:** do `surface-adapter`, `improvement-agent`, `approval-channel` have cleanly-definable public interfaces that survive the move unchanged? Likely yes for mechanical code; each needs a quick audit before migration commits.
- **Test coverage of moved components:** are `src/*` subcomponents well-tested today? Move-only safety depends on tests surfacing drift. If coverage is thin, the Phase 3 contributor may want to add tests *first*, then move.
- **`.github/scripts/` replacement UX:** does replacing (say) `run-assurance-gate.js` with `npx skills-repo verify --ci` keep the same CI output / exit-code semantics downstream workflows may rely on? Replace-then-verify pattern required.
- **CODEOWNERS file activation:** does craigfo/skills-repo have review-protection rules set up? If not, CODEOWNERS is documentation-only. Either is fine; note the posture explicitly when landing.
- **`standards/` ownership:** is the Phase 3 contributor also the maintainer here, or is that shared with CoP co-owners? Worth confirming.

---

## Impact on existing work

- **`outputs/005-mvp-cli-honest-retrospective.md`** — Gate 4 (real CI assurance gate, ~1h) should be sequenced *after* this consolidation so it invokes the CLI rather than duplicating it. No change to the gate list itself.
- **Phase 3 work in flight** — if the Phase 3 contributor is currently modifying `.github/scripts/run-assurance-gate.js` or any logic in `src/`, that work should merge before migration commits start, or migration waits. **This is the single biggest coordination point.** Recommend direct discussion before any implementation begins.
- **Ongoing productisation gates (1, 2, 6 from 005)** — unaffected; all `cli/` work.
- **Dogfood script `cli/scripts/dogfood-run.sh`** — unaffected; already passes against the current engine.
- **The other contributor's view of this proposal** — the whole point of the Option-B approach. If they disagree with the control-plane principle, this is the place to say so before any code moves.

---

## Next steps

1. This proposal lives at `artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md` alongside a partial `discovery.md` that inherits the same framing.
2. Open a cross-fork PR (`craigfo:master` → `heymishy:master`) that includes the productisation MVP + this proposal + the partial discovery. PR title: *"Productisation thread MVP + engine-consolidation proposal (CLI as control plane)."*
3. Notify the Phase 3 contributor. Ask for feedback on the **principle** (Part 1's control-plane framing) — not just the packaging.
4. Iterate on this file in PR comments until aligned.
5. When accepted: mark Status → Accepted; open a second PR with the concrete `product/*` edits + new `CONTRIBUTING.md`.
6. When that merges: run `/clarify` → `/benefit-metric` → `/definition` on this feature folder to plan the actual migration work. Migration proceeds one subcomponent at a time, each move-only, each sequenced against Phase 3 work.
