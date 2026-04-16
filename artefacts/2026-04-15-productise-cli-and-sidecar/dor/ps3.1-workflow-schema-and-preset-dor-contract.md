# Contract Proposal: ps3.1-workflow-schema-and-preset — `workflow.yaml` schema and one real preset

## What will be built

- `src/engine/workflow.ts` — schema loader + validator (JSON Schema).
- `src/engine/resolver.ts` — pure next-step selector; driven by state + workflow.
- Bundled preset: `presets/story-unit-min.yaml` with 5 steps (definition → test-plan → DoR → implement (external) → DoD).
- Replace trivial hard-coded workflow in ps1.1's `run` with preset-driven resolution + skill loader from `.skills-repo/skills/<id>/SKILL.md`.
- `mark-step-done` sub-command: `skills-repo artefact <slug> mark-step-done <step>` (approved scope addition per decisions.md).
- WARN emitter contract (stderr `WARN:` prefix + trace severity `warning`) on invalid workflow.yaml composition (non-blocking).
- Atomic state writes (temp+rename) at phase boundaries.
- Exit code 2 for external step checkpoints.

## What will NOT be built

- Multiple presets beyond `story-unit-min`.
- `workflow validate` refusal of invalid sequences (deferred per discovery OOS #10 and retained as LOW for later).
- External-step approval channel adapters (Jira/Slack/Confluence) — OOS.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `preset-story-unit-min-passes-schema` | Unit |
| AC2 | `run-next-resolves-first-satisfied-step` | Integration |
| AC3 | `run-next-skips-completed-steps` | Integration |
| AC4 | `external-step-exits-2-and-mark-step-done-advances` | E2E |
| AC5 | `invalid-workflow-warns-but-does-not-block` | Integration |
| AC6 | `sigint-leaves-sidecar-in-consistent-state` | Integration |

## Assumptions

- JSON Schema validator (`ajv` or similar) available for workflow.yaml validation.
- Skill loading is file-read only — no dynamic eval.
- State file is small enough (<1 MB) that atomic write via temp+rename is reliable on all target filesystems.

## Estimated touch points

- **New:** `src/engine/workflow.ts`, `src/engine/resolver.ts`, `src/engine/state.ts`, `presets/story-unit-min.yaml`, `src/schemas/workflow.yaml.schema.json`, `src/cli/artefact.ts` (sub-command).
- **Modified:** `src/engine/run.ts` (replace hard-coded workflow), `src/cli/cli.ts` (dispatch for new sub-command).

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
