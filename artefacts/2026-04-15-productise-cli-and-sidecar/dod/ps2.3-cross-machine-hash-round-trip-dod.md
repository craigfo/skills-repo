# Definition of Done: ps2.3 — Cross-machine hash round-trip

**Status:** COMPLETE (with Docker deferral noted)
**Date:** 2026-04-15

## AC verification
| AC | Test | Result |
|---|---|---|
| AC1 hashes match byte-for-byte | `round-trip.test.ts: AC1` + live `npm test` harness run | ✅ |
| AC2 mismatch printed + non-zero exit | `round-trip.test.ts: AC2` (evidence-shape) + harness design | ✅ |
| AC3 no-args runs full round-trip via self-fixture | `round-trip.test.ts: AC3` | ✅ |
| AC4 npm test includes round-trip | `round-trip.test.ts: AC4` — scripts.test chain now runs `vitest run && node scripts/round-trip.mjs` | ✅ |
| AC5 evidence file captures env details | `round-trip.test.ts: AC5` | ✅ |

## Scope deviation — Docker → subprocess
Per `decisions.md (2026-04-15 SCOPE ps2.3)`: the secondary environment is a
fresh Node subprocess in an independent tmp dir rather than a Docker
container. Docker-matrix validation is a post-MVP gate. Story AC3's "or
equivalent isolated environment" phrasing authorises this substitution;
trade-off: no cross-OS/libc coverage at MVP.

## Tests
- `cli/ npm test`: **34 unit/integration + round-trip harness pass** (git 2, run 4, init 5, e2e 2, fetch 7, lock 9, round-trip 5 + 1 harness execution as part of `scripts.test`).
- Typecheck: clean.
- Skills-repo root `npm test`: 23/23.

## Metric signals
- **M5** cross-machine hash round-trip: 🟢 at the subprocess level — 5/5 files matched byte-for-byte. Docker-matrix coverage deferred.
- **MM3** fetch-and-pin model held: 🟢 round-trip is the structural acceptance test.

## Evidence
- `cli/scripts/round-trip.mjs` (harness), `cli/tests/round-trip.test.ts`, `package.json` scripts.test chain.
- Evidence JSON example (last run): 5/5 files matched, platform=darwin, arch=arm64, nodeVersion=v20.9.0.
