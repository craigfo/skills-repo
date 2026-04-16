# Contract Proposal: ps2.3-cross-machine-hash-round-trip — Cross-machine hash round-trip acceptance test

## What will be built

- `scripts/round-trip-test.sh` + `scripts/round-trip.mjs` orchestrator.
- Docker spawner invoking `node:20-alpine` with fixture ref mounted.
- Primary vs secondary lockfile diff; pretty-print mismatches with first/last 40 bytes.
- Integration into `npm test` (package.json scripts.test chain).
- Evidence-file writer capturing OS, node version, container image+digest, source ref, lockfile hash.
- Deliberately-tampered-fixture injection for the mismatch test.

## What will NOT be built

- Windows parity (post-MVP).
- Lockfile signature verification.
- Multi-source round-trip (one source at MVP).

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `hashes-match-byte-for-byte-across-environments` | E2E / harness |
| AC2 | `mismatch-prints-diff-and-exits-non-zero` | E2E |
| AC3 | `no-args-runs-full-round-trip` | E2E |
| AC4 | `npm-test-includes-round-trip` | Integration |
| AC5 | `dod-evidence-file-captures-environment-details` | E2E |

## Assumptions

- Docker is installed and runnable on the operator's primary machine.
- `node:20-alpine` image is pullable from the default registry.
- Host filesystem does not alter bytes when volume-mounted into the container (Docker Desktop on macOS has passed this in practice; validated by AC1).

## Estimated touch points

- **New:** `scripts/round-trip-test.sh`, `scripts/round-trip.mjs`, `scripts/evidence-writer.mjs`, evidence output location under `workspace/round-trip-evidence/`.
- **Modified:** `package.json` (scripts.test chain), `README.md` (one-liner for how to run locally).

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
