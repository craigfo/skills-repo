# Verification Script: ps2.1 — Fetch skills and standards at `init`

**Story reference:** `stories/ps2.1-fetch-from-configurable-source.md`
**Audience:** operator (as reviewer proxy), post-merge smoke.

## Setup

1. Clean test directory; `git init`.
2. Before running `init`, edit `profile.yaml` (after `init --dry-run` writes a draft, or edit by flag) to set `source.url` to `https://github.com/craigfo/skills-repo.git` and `source.ref` to the MVP test-fixtures tag (e.g. `test-fixtures/mvp-v0.0.1`).

## Scenario 1 — Skills and standards arrive under the sidecar (AC1)

1. Run: `skills-repo init --source=https://github.com/craigfo/skills-repo.git --ref=test-fixtures/mvp-v0.0.1 --yes`.
2. Run: `ls .skills-repo/skills/` and `ls .skills-repo/standards/`.

**Expected:** both folders contain files; file paths match what the `story-unit-min` preset expects (e.g. `skills/definition/SKILL.md`, `standards/software-engineering/core.md`).

## Scenario 2 — Files match the source byte-for-byte (AC2)

1. Pick any resolved file: `cat .skills-repo/skills/definition/SKILL.md`.
2. Compare to the same file at the source ref on GitHub (open in browser).

**Expected:** content is identical. No inserted carriage returns, no missing first byte, no BOM change. A `shasum -a 256` of the local file matches the GitHub raw-content hash.

## Scenario 3 — Branch ref warns but proceeds (AC3)

1. Re-run `init` with `--ref=master` instead of a tag.
2. Read stderr.

**Expected:** a warning line appears mentioning branch refs and recommending tag or commit. Command still completes (exit 0). The snapshot is still written.

## Scenario 4 — Unreachable source fails cleanly (AC4)

1. Run: `skills-repo init --source=https://example.invalid/repo.git --ref=v1.0.0 --yes`.

**Expected:** exit non-zero. Error message names `https://example.invalid/repo.git` and a specific failure (DNS / 404 / timeout). `.skills-repo/skills/` and `.skills-repo/standards/` are empty or absent — not half-populated.

## Scenario 5 — CLI flags override profile.yaml (AC5)

1. Set `profile.yaml` `source.url` to one URL.
2. Run `init --source=<different-url> --ref=<different-ref>`.
3. After completion, `cat .skills-repo/profile.yaml`.

**Expected:** the `profile.yaml` now reflects the command-line values, not the pre-existing template values. Resolved snapshots match the command-line source.

## Reset

Between scenarios, `rm -rf .skills-repo artefacts` and re-run `init` with the scenario-specific flags.
