# Implementation Plan: ps1.1 — End-to-end CLI skeleton

**Story:** `stories/ps1.1-end-to-end-cli-skeleton.md`
**Contract:** `dor/ps1.1-end-to-end-cli-skeleton-dor-contract.md`
**Branch:** `feature/ps1.1-end-to-end-cli-skeleton`

## Tasks (TDD order)

1. **Scaffold CLI package** — `cli/package.json`, `cli/tsconfig.json`, `cli/vitest.config.ts`, bin shim. Devdeps: vitest, tsx, typescript, @types/node. No runtime deps (keep MVP minimal).
2. **Engine: `sidecar.ts`** — paths module: `SIDECAR_DIR=".skills-repo"`, `ARTEFACTS_DIR="artefacts"`, helpers for writing workflow.yaml / profile.yaml / lock.json / trivial skill file.
3. **Engine: `git.ts`** — `isGitRepo(cwd)` using `git rev-parse --is-inside-work-tree`.
4. **Engine: `trace.ts`** — append JSONL line to `.skills-repo/traces/<run-id>.jsonl`.
5. **Engine: `trivial-skill.ts`** — hard-coded "built-in trivial skill" that, when executed, writes `artefacts/<slug>/hello.md`.
6. **Command: `init.ts`** — entry: verify git; bail cleanly if not; scaffold sidecar dirs + stub files; append .gitignore if confirmed; emit trace.
7. **Command: `run.ts`** — entry: load trivial skill from sidecar; create slug folder under artefacts/ (hard-coded slug "default" for ps1.1); execute; write artefact; emit trace.
8. **CLI dispatch: `cli.ts`** — `commander` or hand-rolled args; dispatches `init` / `run next`; returns exit codes.
9. **Tests (failing first):**
   - `git.test.ts` — isGitRepo true/false
   - `init.test.ts` — init writes expected files; non-git aborts; gitignore appends
   - `run.test.ts` — run executes skill, writes artefact, writes trace
   - `e2e/full-cycle.test.ts` — spawn CLI binary via tsx; run init + run next in a tmp repo; assert git-status shows only sidecar + artefacts
10. **Implement to pass** — fill in each module until tests go GREEN.
11. **Guardrail entry** — add new `Guardrails Registry` block to `.github/architecture-guardrails.md` per ARCH decision (decisions.md entry for ps1.1 1-M2).

## Out-of-branch follow-ups
- None for ps1.1.

## Definition of done (mirrors story DoD criteria)
- `cli/` package exists with passing tests (npm test)
- `ls .worktrees/ps1.1/` + post-run `git status` shows exactly `.skills-repo/` and `artefacts/` mutations (AC5)
- Guardrail registered
