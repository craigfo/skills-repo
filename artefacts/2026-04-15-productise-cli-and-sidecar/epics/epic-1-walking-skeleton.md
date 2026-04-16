## Epic: Walking skeleton — end-to-end CLI backbone works on a clean repo

**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`
**Slicing strategy:** Walking skeleton

## Goal

On a fresh empty git repo, the operator installs the CLI package, runs `init`, then runs one `run next` cycle, and the result is: a `.skills-repo/` sidecar exists with config + trivial resolved skill, an `artefacts/<slug>/` folder holds one file produced by the skill, and nothing else in the host repo was touched. The end-to-end backbone is proven with a trivial built-in skill before any real fetch, hashing, or preset machinery exists. Every subsequent epic fleshes out the skeleton.

## Out of Scope

- No fetch from a remote source — this epic uses an inline trivial skill compiled into the CLI package itself. The fetch model is Epic 2.
- No `lock.json` semantics — a placeholder file may be written, but hash pinning and verification are Epic 2.
- No `workflow.yaml` schema complexity — this epic uses a hard-coded single-step workflow. Real presets are Epic 3.
- No `status` / `artefact new` / `verify` commands — Epic 3.
- No `adopt` / `new` / `upgrade` — all OOS per discovery.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| M1 — Sidecar-only footprint | N/A (new) | Exactly `.skills-repo/` + `artefacts/` + optional `.gitignore` line | This epic defines and enforces the sidecar-only write contract end-to-end. |
| MM1 — Dogfood delivery on packaged CLI | 0 | ≥1 full chain via CLI before ship | First CLI invocation on a test repo produces an artefact — seeds MM1. |

## Stories in This Epic

- [ ] `ps1.1` — End-to-end CLI skeleton: stubbed package, `init` creates sidecar, `run next` produces one artefact — `stories/ps1.1-end-to-end-cli-skeleton.md`

## Human Oversight Level

**Oversight:** Medium
**Rationale:** Net-new CLI package code; operator reviews each PR, coding agent drives implementation between checkpoints.

## Complexity Rating

**Rating:** 2

## Scope Stability

**Stability:** Stable
