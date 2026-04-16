# Contract Proposal: ps3.2-status-and-artefact-new — `status` and `artefact new` commands

## What will be built

- `src/cli/status.ts` — reads `.skills-repo/state/`, `.skills-repo/workflow.yaml`, `artefacts/<active-slug>/` presence; computes current+next step; surfaces blocking issues; exit 1 on blocking.
- `src/cli/artefact.ts` extension — `artefact new <slug>` sub-command creates `artefacts/<slug>/reference/`; records active feature in state; refuses duplicate slug.
- `.skills-repo/state/last-activity` ISO-8601 field written on every state write; `status` reads it (mtime fallback) for resume-aware display.
- Trace entries on both commands.

## What will NOT be built

- `status --json` machine-readable output.
- `artefact list` / `artefact rm`.
- Multi-feature-active concurrency.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `status-on-fresh-sidecar-shows-no-active-feature` | Integration |
| AC2 | `status-reports-correct-next-step` | Integration |
| AC3 | `artefact-new-scaffolds-feature-folder-and-state` | Integration |
| AC4 | `artefact-new-refuses-existing-slug` | Integration |
| AC5 | `status-surfaces-blocking-issues-with-exit-1` | Integration |
| AC6 | `status-shows-last-activity-after-24h` | Integration |

## Assumptions

- `status` is read-only — a fuzz test verifies no writes occur to `.skills-repo/skills/` or `/standards/`.
- Date math uses UTC-anchored ISO-8601 to avoid timezone surprises.

## Estimated touch points

- **New:** `src/cli/status.ts`, extension of `src/cli/artefact.ts`, `tests/status.*.test.ts`, `tests/artefact-new.*.test.ts`.
- **Modified:** `src/engine/state.ts` (add `last-activity` field).

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
