# Test Plan: ps2.3 — Cross-machine hash round-trip

**Story reference:** `stories/ps2.3-cross-machine-hash-round-trip.md`
**Review:** PASS Run 2 — 1 LOW carried ("or equivalent environment" escape).
**Framework:** Node + bash orchestration script (`scripts/round-trip-test.sh`), invoked by `npm test` or standalone. Primary environment: macOS/Linux host. Secondary: Docker `node:20-alpine` container.
**AC count:** 5

## Test data strategy
**Type:** Fixtures — same `test-fixtures/mvp-v0.0.1` ref. Lockfile captured on primary environment, compared on secondary.
**PCI / sensitivity:** None.

## Exit-code contract

| Condition | Exit |
|---|---|
| all hashes match on both environments | 0 |
| any hash differs between primary and secondary | non-zero; diff printed |
| secondary environment cannot be spawned (Docker missing, etc.) | non-zero; clear error |

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | E2E / harness | `hashes-match-byte-for-byte-across-environments` |
| AC2 | E2E | `mismatch-prints-diff-and-exits-non-zero` |
| AC3 | E2E | `no-args-runs-full-round-trip` |
| AC4 | Integration | `npm-test-includes-round-trip` |
| AC5 | E2E | `dod-evidence-file-captures-environment-details` |

## Integration / E2E tests

- **`hashes-match-byte-for-byte-across-environments`** (AC1) — run `init` on host; extract hashes from `lock.json`; run `init` inside `docker run --rm -v $PWD:/work node:20-alpine` with same ref; extract hashes; assert equality pair-by-pair.
- **`mismatch-prints-diff-and-exits-non-zero`** (AC2) — inject a transform (e.g. mount a tampered fixture into the container) so one file differs; assert non-zero exit, diff output showing file path, both hashes, first/last 40 bytes of each variant.
- **`no-args-runs-full-round-trip`** (AC3) — invoke `scripts/round-trip-test.sh` with no arguments; assert it performs the full five-step sequence (init primary → spawn container → init secondary → diff → summary line).
- **`npm-test-includes-round-trip`** (AC4) — check `package.json` `scripts.test` resolves to a command chain including the round-trip script (directly or via `vitest + post-test hook`); invoke `npm test`; observe round-trip output is part of test output.
- **`dod-evidence-file-captures-environment-details`** (AC5) — after successful round-trip, verify an evidence file at a documented path contains: primary OS + node version, secondary (container image + digest), source ref, lockfile SHA; re-run and confirm regeneration is deterministic.

## NFR tests

- **`round-trip-under-5-minutes-on-laptop-plus-local-docker`** (NFR performance) — time full script; assert < 300 s.
- **`deterministic-pass-across-100-invocations`** (NFR reliability) — in CI or local harness, invoke script 100 times at same ref; assert 100 passes. (Pragmatic test runner may run a smaller N with a note.)
- **`trace-entry-captured`** (NFR audit) — after success, assert a trace entry in `.skills-repo/traces/` on the primary environment.

## Gap table

| Gap | Handling | Owner |
|---|---|---|
| LOW 1-L1 (review): "or equivalent isolated environment" escape clause | Tighten in harness: the CI matrix row counts only if it uses the documented `node:20-alpine` image; non-Docker equivalents require an explicit opt-in flag | Operator |
| Windows parity | Accepted as post-MVP (see story OOS) — documented in this plan; not covered | Operator |

## TDD note

The mismatch test requires a deliberately-tampered fixture. Build that fixture as part of this test (not committed to the main fixture tag) — a one-line sed script run in the container at test time.
