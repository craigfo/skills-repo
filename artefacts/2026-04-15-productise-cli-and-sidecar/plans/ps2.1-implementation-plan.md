# Implementation Plan: ps2.1 — Fetch skills and standards from a configurable source

**Story:** `stories/ps2.1-fetch-from-configurable-source.md`
**Contract:** `dor/ps2.1-fetch-from-configurable-source-dor-contract.md`
**Branch:** `feature/ps2.1-fetch-from-configurable-source`

## Tasks (TDD order)

1. **Engine: `fetch.ts`** — `fetch(source, ref, destSidecarDir) → {files, refKind}`. Implementation: shell out to `git clone --depth=1 --branch=<ref> <url> <tmp>`; iterate preset mappings; copy raw bytes with `readFileSync(path)` → `writeFileSync(dest, buffer)` (no encoding conversion). Remove tmp on exit.
2. **Engine: `ref-classify.ts`** — classify a ref as `"tag" | "commit" | "branch"` using git ls-remote.
3. **Engine: `preset.ts`** — hardcoded MVP preset `story-unit-min` with a `sources` list: `[{from, to}]` tuples; later loaded from YAML bundled with the engine.
4. **Engine: `sidecar.ts`** — extend `scaffoldSidecar` with an optional `fetch` hook: when source is provided, fetch after creating the sidecar shape, replacing the trivial skill with real content.
5. **CLI parsing** — accept `--source=<url>` and `--ref=<tag>` on `init`; persist into `profile.yaml`.
6. **`profile.yaml` schema v1** — `source: { url, ref, refKind }`; write on init.
7. **Transactional failure** — if fetch fails, remove `.skills-repo/skills/` and `.skills-repo/standards/` (but leave workflow.yaml / profile.yaml so operator can retry with corrected flags).
8. **Branch-ref WARN** — emit `WARN:` line when refKind is `"branch"`.
9. **Tests** — local bare-git-repo fixture harness; cover AC1–AC5 with fetch from `file://` URL. Real-source e2e skipped at MVP (no network dep).
10. **Wire trace entry** on successful fetch.

## Out-of-branch

- Real `test-fixtures/mvp-v0.0.1` tag on `craigfo/skills-repo` is optional at MVP; deferred until ps2.3 needs it for cross-machine test.

## DoD

- All ps2.1 ACs backed by passing tests (integration + e2e)
- `npm test` in cli/ green
- `npm test` at skills-repo root still green (governance unaffected)
- Trace entries emitted
