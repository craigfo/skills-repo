# Definition of Done: ps3.2 — `status` + `artefact new`

**Status:** COMPLETE
**Date:** 2026-04-15

## AC verification
| AC | Test | Result |
|---|---|---|
| AC1 status on fresh sidecar reports no active feature | `status.test.ts: AC1` | ✅ |
| AC2 status reports correct next step after partial progress | `status.test.ts: AC2` | ✅ |
| AC3 artefact new scaffolds + sets active | `status.test.ts: AC3` | ✅ |
| AC4 artefact new refuses duplicate slug | `status.test.ts: AC4` | ✅ |
| AC5 blocking issues exit 1 | `status.test.ts: AC5` | ✅ |
| AC6 last-activity from state file | `status.test.ts: AC6` | ✅ |

## Tests
- cli/ `npm test`: **50 vitest + round-trip harness**; all green.
- Typecheck: clean.
- Skills-repo root: 23/23.

## Metric signals
- **M3 resume-after-pause** — 🟢 `status` is the read-only resume surface; pipeline-state's `lastActivity` field is the canonical signal (mtime fallback only when state absent).

## Scope deviations
None. AC6's mtime fallback is retained but state-file timestamp is preferred per review LOW resolution.

## Evidence
- `cli/src/commands/status.ts`, updated `cli/src/commands/artefact.ts`, updated `cli/src/cli.ts`, `cli/tests/status.test.ts`.
