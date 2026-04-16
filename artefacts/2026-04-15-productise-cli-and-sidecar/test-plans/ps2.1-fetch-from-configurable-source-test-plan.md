# Test Plan: ps2.1 — Fetch skills and standards from a configurable source at `init`

**Story reference:** `stories/ps2.1-fetch-from-configurable-source.md`
**Review:** PASS Run 2 (2026-04-15) — 1 LOW carried: AC5 override+persistence split.
**Framework:** Vitest + E2E CLI wrappers. Fixture source: a pinned test ref (e.g. `refs/tags/test-fixtures/mvp-v0.0.1`) on `craigfo/skills-repo` containing a minimal skill set (~5 files) for deterministic fetch tests.
**AC count:** 5

## Test data strategy
**Type:** Fixtures — static pinned ref on `craigfo/skills-repo` provides the source tree under test. Network tests use this ref; offline tests use a local bare-git mirror of the same ref.
**PCI / sensitivity:** None.
**Gap:** the `test-fixtures/mvp-v0.0.1` tag doesn't exist yet — must be created before tests run. Flagged as a dependency to resolve during ps2.1 implementation, not before.

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | Integration | `init-fetches-preset-files-to-sidecar` |
| AC2 | Integration | `fetched-files-are-byte-identical-to-source` |
| AC3 | Unit / Integration | `branch-ref-emits-warning-and-proceeds` |
| AC4 | E2E | `unreachable-source-exits-non-zero-with-clean-state` |
| AC5 | E2E | `cli-flags-override-profile-yaml-values` |

## Unit tests

- **`branch-ref-detection`** (AC3) — given `source.ref = "main"`, CLI classifies as `branch` and emits warning to stderr; given `source.ref = "v1.0.0"`, classifies as `tag`; given 40-char hex, classifies as `commit`.
- **`byte-preservation-hash-equality`** (AC2) — given known file content, CLI writes identical bytes (no EOL conversion, no BOM strip); SHA-256 of written file equals SHA-256 of source bytes.

## Integration / E2E tests

- **`init-fetches-preset-files-to-sidecar`** (AC1) — with `profile.yaml.source = <fixture-ref>`, run `init`; assert each expected file from the preset is present under `.skills-repo/skills/` or `.skills-repo/standards/` at the expected path.
- **`fetched-files-are-byte-identical-to-source`** (AC2) — compute SHA-256 of each resolved file; compare against known-good hash (pre-computed from the test-fixtures ref).
- **`branch-ref-emits-warning-and-proceeds`** (AC3) — run `init` with branch ref; capture stderr; assert "WARN" line mentioning the ref; assert exit code 0.
- **`unreachable-source-exits-non-zero-with-clean-state`** (AC4) — set `source.url` to `https://example.invalid/repo.git`; assert exit ≠ 0, stderr names the URL, no files left in `.skills-repo/skills/` or `/standards/` (transactional).
- **`cli-flags-override-profile-yaml-values`** (AC5) — run `init --source=<alt-url> --ref=<alt-tag>`; assert resolved snapshot matches alt-source content, `profile.yaml` written with alt values.

## NFR tests

- **`fetch-preset-under-30-seconds-on-broadband`** (NFR performance) — time `init` against fixture ref; assert < 30 s.
- **`no-credentials-in-source-urls`** (NFR security) — lint `profile.yaml` shape; reject if `source.url` contains `@` with userinfo or embedded token.
- **`successful-fetch-writes-trace-entry`** (NFR audit) — after `init`, assert JSONL line with `type: "fetch"`, `source`, `ref`, `files` count, `timestamp`.
- **`fetch-is-transactional`** (NFR reliability) — inject failure mid-fetch (kill test transport after N files written to temp); assert `.skills-repo/skills/` and `/standards/` are empty on restart.

## Gap table

| Gap | Handling | Owner |
|---|---|---|
| Test-fixtures tag doesn't exist yet | Create `test-fixtures/mvp-v0.0.1` during ps2.1 implementation before tests run | Operator |
| LOW 1-L1 (review Run 2): AC5 combines override + persistence — split in this plan: the `cli-flags-override` test covers both halves; consider splitting into two ACs if implementation is forced to split | Single test covers both halves for MVP; split only if implementation divergence shows up | Operator |

## TDD discipline note

All tests fail against current state (no CLI, no fetch). The byte-preservation test is the highest risk: if the Node fs APIs default to any encoding conversion on write, this test will fail and force implementation to use `{encoding: 'binary'}` or raw Buffer writes.
