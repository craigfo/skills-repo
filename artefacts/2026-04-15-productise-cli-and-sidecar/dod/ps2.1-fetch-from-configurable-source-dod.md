# Definition of Done: ps2.1 — Fetch skills and standards from a configurable source

**Story:** `stories/ps2.1-fetch-from-configurable-source.md`
**Contract:** `dor/ps2.1-fetch-from-configurable-source-dor-contract.md`
**Date:** 2026-04-15
**Status:** COMPLETE

## AC verification

| AC | Verified by | Result |
|----|---|---|
| AC1 fetch preset files to sidecar | `tests/fetch.test.ts: AC1` | ✅ |
| AC2 byte-identical (SHA-256) | `tests/fetch.test.ts: AC2` | ✅ |
| AC3 branch-ref WARN + proceed | `tests/fetch.test.ts: AC3` | ✅ |
| AC4 unreachable source exits non-zero, clean state | `tests/fetch.test.ts: AC4` | ✅ |
| AC5 `--source` / `--ref` override + profile.yaml persistence | `tests/fetch.test.ts: AC5` | ✅ |
| (bonus) rollback on mid-fetch failure | `tests/fetch.test.ts: rolls back partial writes` | ✅ |
| (bonus) fetch trace entry | `tests/fetch.test.ts: writes a 'fetch' trace entry` | ✅ |

## Test results

- `cli/ npm test` — **20 passed (20)**: git (2), run (4), init (5), e2e (2), fetch (7).
- `cli/ npm run typecheck` — clean.
- Skills-repo root `npm test` — **23 passed (23)**.

## Metric signals

| Metric | Signal |
|---|---|
| M4 Auditor self-service on snapshots | 🟢 Snapshots written byte-identically to `.skills-repo/skills/` and `/standards/`; AC2 validates. |
| MM3 Fetch-and-pin model held (fetch half) | 🟢 Fetch succeeds on all tested fixtures; branch-ref WARN emitted; pin half arrives in ps2.2. |
| M1 Sidecar footprint | 🟢 Still enforced — tests assert no writes outside `.skills-repo/` and `artefacts/`. |

## Scope deviations

- **None.** Contract scope matches implementation. `test-fixtures/mvp-v0.0.1` tag on `craigfo/skills-repo` deferred (tests use local bare-git fixtures; no network dependency at MVP). Flagged as nice-to-have before ps2.3 real-source cross-machine test.

## Architecture compliance

- ✅ Guardrail MC-CLI-01 (no writes outside sidecar) still honoured.
- ✅ C5 / C13 respected — fetch is structural, not instructional; byte preservation enforced in code.
- Rollback pattern (clear `.skills-repo/skills/` + `/standards/` on mid-fetch failure) leaves operator able to retry.

## Evidence

- Source: `cli/src/engine/fetch.ts`, `cli/src/engine/preset.ts`, `cli/src/engine/ref-classify.ts`, modified `cli/src/engine/sidecar.ts`, modified `cli/src/commands/init.ts`, modified `cli/src/cli.ts`.
- Tests: `cli/tests/fetch.test.ts`, `cli/tests/fetch-helpers.ts`.
- Implementation plan: `plans/ps2.1-implementation-plan.md`.

## Carried LOW findings

- Review Run 1 LOW 1-L1 (AC5 override vs persistence) — single test covers both halves; fine for MVP.
