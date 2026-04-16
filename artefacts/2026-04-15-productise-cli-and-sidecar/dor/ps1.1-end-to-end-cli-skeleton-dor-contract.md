# Contract Proposal: ps1.1 — End-to-end CLI skeleton

## What will be built

A Node.js CLI package (stubbed skill-library) with:
- `src/cli/` — CLI entry, command dispatch.
- `src/engine/init.ts` — verifies git-repo; creates `.skills-repo/{workflow.yaml, profile.yaml, lock.json(placeholder), skills/<trivial-skill>/SKILL.md}` + empty `artefacts/`; prompts + appends `.gitignore` lines if confirmed; atomic failure path.
- `src/engine/run.ts` — reads workflow.yaml, executes the single hard-coded trivial skill, writes one artefact to `artefacts/<slug>/`.
- `src/engine/trace.ts` — appends a JSONL line per command.
- `package.json` for publishable npm package; `vitest.config.ts`; minimal README.
- Vitest unit + integration + E2E wrapper tests matching the test plan.
- New Guardrails Registry entry in `.github/architecture-guardrails.md` ("CLI commands never write outside `.skills-repo/` or `artefacts/` except the confirmed `.gitignore` append") per ARCH decision.

## What will NOT be built

- Real fetch from remote source (`ps2.1`).
- Lockfile hash verification (`ps2.2`).
- `workflow.yaml` schema validation and preset resolution (`ps3.1`).
- `status` / `artefact new` (`ps3.2`).
- `adopt` / `new` / `upgrade` / `verify --ci`.
- Any skill other than the trivial built-in.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `init-creates-only-sidecar-and-artefacts-on-clean-repo` | E2E |
| AC2 | `init-appends-gitignore-lines-when-confirmed` | E2E |
| AC3 | `run-next-executes-trivial-skill-and-writes-one-artefact` | E2E |
| AC4 | `init-aborts-non-zero-when-host-is-not-git-repo` | Unit |
| AC5 | `git-status-shows-only-sidecar-and-artefacts-after-any-command` | E2E |

## Assumptions

- Node ≥18 available on target; npm ≥9.
- `git` CLI in PATH (detection via `git rev-parse --is-inside-work-tree`).
- Vitest ≥1.x as test runner.
- TypeScript as primary source language; compiled JS shipped in package.

## Estimated touch points

- **New:** `src/cli/`, `src/engine/`, `package.json`, `vitest.config.ts`, `tests/`, bundled preset `presets/story-unit-min.yaml` (stubbed with trivial skill for this story).
- **Modified:** `.github/architecture-guardrails.md` (new Guardrails Registry entry).
- **Services / APIs:** None external. No network.

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
