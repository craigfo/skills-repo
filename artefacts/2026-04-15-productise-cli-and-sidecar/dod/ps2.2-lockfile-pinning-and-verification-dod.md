# Definition of Done: ps2.2 — Lockfile pinning and verification

**Status:** COMPLETE
**Date:** 2026-04-15

## AC verification
| AC | Test | Result |
|---|---|---|
| AC1 lockfile shape | `lock.test.ts: AC1` | ✅ |
| AC2 verify before execution (pass) | `lock.test.ts: AC2` | ✅ |
| AC3 tampered file → exit 5 | `lock.test.ts: AC3` | ✅ |
| AC4 missing file → exit 4 | `lock.test.ts: AC4` | ✅ |
| AC5 branch-refKind verify WARN | `lock.test.ts: AC5` | ✅ |
| AC6 missing lockfile → exit 3 | `lock.test.ts: AC6` | ✅ |

## Tests
- `cli/ npm test`: **29/29 passed** (git 2, run 4, init 5, e2e 2, fetch 7, lock 9).
- typecheck: clean.
- skills-repo root `npm test`: 23/23.

## Metric signals
- **M5** cross-machine round-trip — lockfile + verification shipped; ps2.3 exercises it end-to-end across environments.
- **MM3** fetch-and-pin model — **complete**; structural pinning + verify live.
- **M4** auditor self-service — still green (snapshots unchanged).

## Scope deviations
None.

## Architecture compliance
- ✅ C5 hash-verification now structural (in code), not instructional.
- ✅ C13 structural governance: verify runs unconditionally before any skill execution.
- ✅ Guardrail MC-CLI-01 still honoured (no out-of-sidecar writes).

## Evidence
- `cli/src/engine/lock.ts`, modified `cli/src/commands/init.ts`, modified `cli/src/commands/run.ts`, `cli/tests/lock.test.ts`.
