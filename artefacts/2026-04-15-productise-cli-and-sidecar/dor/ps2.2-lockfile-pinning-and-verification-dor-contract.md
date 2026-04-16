# Contract Proposal: ps2.2-lockfile-pinning-and-verification — Lockfile pinning and verification

## What will be built

- `src/engine/lock.ts` — lockfile reader/writer; SHA-256 per file; stable schema with `engineVersion`, `source.{url,ref,refKind}`, `files[].{path,sha256}`.
- Extension of `init` to write the lockfile after fetch.
- Pre-execution verification in `run` with exit-code contract (0 pass / 3 missing lockfile / 4 missing file / 5 hash mismatch).
- Branch-refKind WARN emitter.
- Trace entries: verify pass + verify fail with mismatches.

## What will NOT be built

- Cross-machine round-trip test (ps2.3).
- Automatic re-fetch on mismatch (strict-fail only at MVP).
- Signature verification / GPG / Sigstore.
- Lockfile diff tooling or `upgrade` preview.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `init-writes-lock-json-with-expected-shape` | Integration |
| AC2 | `run-verifies-all-files-before-execution` | Integration |
| AC3 | `tampered-file-blocks-run-with-mismatch-error` | Integration |
| AC4 | `missing-file-blocks-run-with-clear-error` | Integration |
| AC5 | `branch-refkind-emits-verify-warning` | Integration |
| AC6 | `missing-lockfile-blocks-run-points-to-init` | Integration |

## Assumptions

- Node `crypto` module `createHash('sha256')` produces canonical lowercase hex output.
- Lockfile JSON is stable under JSON.stringify with sorted keys (test will assert determinism).
- Operators will not hand-edit the lockfile at MVP (if they do, mismatches are exactly what AC3 tests).

## Estimated touch points

- **New:** `src/engine/lock.ts`, `tests/lock.*.test.ts`.
- **Modified:** `src/engine/init.ts`, `src/engine/run.ts`, exit-code table in `src/cli/errors.ts`.

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
