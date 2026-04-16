# Implementation Plan: ps3.2 — status + artefact new

**Branch:** `feature/ps3.2-status-and-artefact-new`

## Tasks
1. `cli/src/commands/status.ts` — read-only; exit 1 on blocking issues (missing lockfile, hash mismatch, missing lockfile file). Prefers pipeline-state `lastActivity`; mtime fallback.
2. Extend `cli/src/commands/artefact.ts` with `new <slug>` subcommand — mkdir + reference/ scaffold + sets active slug in state; refuses existing slug.
3. Wire both into `cli.ts` dispatch.
4. 8 status.test.ts tests covering AC1–AC6 + read-only invariant + missing-lockfile blocking.
