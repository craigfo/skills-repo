# Test Plan: ps2.2 — Lockfile pinning and verification

**Story reference:** `stories/ps2.2-lockfile-pinning-and-verification.md`
**Review:** PASS Run 2 — 1 LOW carried (exit-code table).
**Framework:** Vitest + E2E CLI wrappers.
**AC count:** 6

## Test data strategy
**Type:** Fixtures — same `test-fixtures/mvp-v0.0.1` ref as ps2.1; a second fixture `test-fixtures/mvp-tampered` with one file byte-modified for the mismatch tests.
**PCI / sensitivity:** None.

## Exit code table (resolves review LOW 1-L1)

| Condition | Exit code |
|---|---|
| verify pass | 0 |
| lock.json missing | 3 |
| file missing from disk | 4 |
| hash mismatch | 5 |
| branch ref warning (verify still passes) | 0 (stderr WARN) |

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | Integration | `init-writes-lock-json-with-expected-shape` |
| AC2 | Integration | `run-verifies-all-files-before-execution` |
| AC3 | Integration | `tampered-file-blocks-run-with-mismatch-error` |
| AC4 | Integration | `missing-file-blocks-run-with-clear-error` |
| AC5 | Integration | `branch-refkind-emits-verify-warning` |
| AC6 | Integration | `missing-lockfile-blocks-run-points-to-init` |

## Unit tests

- **`lockfile-schema-shape`** (AC1) — given a set of files with known hashes, serialise lockfile; validate against documented JSON shape.
- **`sha256-lowercase-hex`** (AC1) — computed hash is 64-char lowercase hex, no spaces, no prefix.

## Integration tests

- **`init-writes-lock-json-with-expected-shape`** (AC1) — after `init`, parse `.skills-repo/lock.json`; assert: `engineVersion` non-empty string, `source.url`/`ref`/`refKind`, `files[]` length equals number of fetched files, each entry has `path` + `sha256`.
- **`run-verifies-all-files-before-execution`** (AC2) — stub a skill execution to assert it was called with a verified context; run `run next`; assert the verify step ran first.
- **`tampered-file-blocks-run-with-mismatch-error`** (AC3) — post-init, modify one file's content by one byte; run `run next`; assert exit 5, stderr contains the file path, both hashes (expected and computed).
- **`missing-file-blocks-run-with-clear-error`** (AC4) — delete one file under `.skills-repo/skills/`; run `run next`; assert exit 4, stderr names the missing file, no fetch retry attempted.
- **`branch-refkind-emits-verify-warning`** (AC5) — set `lock.json.source.refKind` to `"branch"`; run `run next`; assert exit 0, stderr contains WARN about branch refs.
- **`missing-lockfile-blocks-run-points-to-init`** (AC6) — delete `.skills-repo/lock.json`; run `run next`; assert exit 3, stderr mentions running `init` or `upgrade`.

## NFR tests

- **`verify-under-500ms-on-20-files`** (NFR performance) — seed sidecar with 20 files; time `run` up to first skill load; assert < 500 ms.
- **`verify-writes-trace-entry`** (NFR audit) — after a verified `run`, assert `.skills-repo/traces/*.jsonl` contains `type: "verify"`, `filesChecked: <n>`, `result: "pass"`.
- **`verify-fail-writes-trace-entry-with-mismatches`** (NFR audit) — after AC3 tampered-file test, assert trace entry `type: "verify"`, `result: "fail"`, `mismatches: [{path, expected, actual}]`.

## Gap table

No gaps.
