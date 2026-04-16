# Contract Proposal: ps2.1-fetch-from-configurable-source — Fetch skills and standards from a configurable source at `init`

## What will be built

- `src/engine/fetch.ts` — resolves source URL + ref (git-https only at MVP); materialises per-file content at ref; writes byte-identical snapshots to `.skills-repo/skills/` and `.skills-repo/standards/` with no EOL/BOM transformation.
- Extension of `src/engine/init.ts` to invoke fetch after git-repo verification.
- `profile.yaml` schema v1 including `source.url`, `source.ref`, `source.refKind`.
- `--source` and `--ref` CLI flag handling with profile.yaml persistence.
- Branch-ref classifier + WARN emitter.
- Transactional failure path (temp-dir materialisation + rename, or rollback on any file write failure).
- Test-fixtures tag `test-fixtures/mvp-v0.0.1` created on `craigfo/skills-repo` as part of this PR.

## What will NOT be built

- Lockfile hash pinning (ps2.2).
- `upgrade` refetch flow.
- Non-git transports (tarball / CDN / npm scope).
- Custom-skill overrides under `.skills-repo/skills/custom/`.

## How each AC will be verified

| AC | Test approach | Type |
|----|---|---|
| AC1 | `init-fetches-preset-files-to-sidecar` | Integration |
| AC2 | `fetched-files-are-byte-identical-to-source` | Integration |
| AC3 | `branch-ref-emits-warning-and-proceeds` | Unit/Integration |
| AC4 | `unreachable-source-exits-non-zero-with-clean-state` | E2E |
| AC5 | `cli-flags-override-profile-yaml-values` | E2E |

## Assumptions

- `git` CLI + HTTPS transport available on operator's machine and CI.
- `craigfo/skills-repo` is reachable from the test environment; tagged ref `test-fixtures/mvp-v0.0.1` will be created before tests run.
- Node fs.writeFile in binary mode preserves bytes (validated by AC2).
- No credentials needed for the default public source at MVP.

## Estimated touch points

- **New:** `src/engine/fetch.ts`, `src/schemas/profile.yaml.schema.json`, fetch-related tests.
- **Modified:** `src/engine/init.ts`, `src/cli/*.ts` (flag parsing).
- **External:** tagged ref on `craigfo/skills-repo` (one-time setup).

## schemaDepends

`[]` — no upstream pipeline-state.json fields consumed.
