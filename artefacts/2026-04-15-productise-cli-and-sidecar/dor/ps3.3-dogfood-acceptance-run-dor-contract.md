# Contract Proposal: ps3.3-dogfood-acceptance-run — Dogfood acceptance run

## What will be built

- `workspace/productisation-incidents.md` (tracking file shell).
- `scripts/collect-dogfood-evidence.mjs` — collects `.skills-repo/traces/` from the dogfood repo into the DoD evidence folder.
- DoD artefact template entries capturing M2 timestamps, `git status --porcelain` output, round-trip re-run result.
- No new CLI code — the dogfood run exercises everything from ps1.1–ps3.2.

## What will NOT be built

- External-adopter acceptance pass (post-MVP gate).
- OS matrix / Windows parity.
- Formal UX protocol / screen recording.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `full-chain-end-to-end-on-dogfood-repo` + scripted post-run assertions | Manual + Scripted |
| AC2 | `time-to-first-artefact-measured-and-recorded` | Manual (M2 measurement) |
| AC3 | `git-status-shows-only-sidecar-and-artefacts-post-run` | Scripted check |
| AC4 | `resume-after-24h-pause-completes-chain` | Manual + Scripted |
| AC5 | `incidents-file-reviewed-at-close` | Manual |
| AC6 | `round-trip-rerun-on-dogfood-lockfile-passes` | Automated |

## Assumptions

- Operator has a clean dogfood test-repo path available outside `skills-repo-productisation/`.
- Installed CLI binary corresponds to the MVP-tag version — no dev/source-linked build.
- `.skills-repo/state/last-activity` field from ps3.2 enables the 24h simulation for AC4.

## Estimated touch points

- **New:** `workspace/productisation-incidents.md`, `scripts/collect-dogfood-evidence.mjs`, DoD evidence folder scaffold.
- **Modified:** DoD template to include evidence-file references.

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
