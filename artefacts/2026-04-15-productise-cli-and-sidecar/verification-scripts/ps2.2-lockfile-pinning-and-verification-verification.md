# Verification Script: ps2.2 — Lockfile pinning and verification

## Setup

1. Fresh test repo; `git init`; `skills-repo init --yes` (using ps2.1 fixture ref).
2. Note the contents of `.skills-repo/lock.json` with `cat`.

## Scenario 1 — Lockfile has the expected shape (AC1)

1. `cat .skills-repo/lock.json`.

**Expected:** JSON with `engineVersion`, `source.url`, `source.ref`, `source.refKind`, and a `files` array where each entry has `path` and a 64-character lowercase-hex `sha256`.

## Scenario 2 — Normal run verifies and proceeds (AC2)

1. Run: `skills-repo run next`.

**Expected:** command proceeds. In `.skills-repo/traces/` a new JSONL line contains `"type":"verify"` and `"result":"pass"`.

## Scenario 3 — Tampered file blocks execution (AC3)

1. Open any file under `.skills-repo/skills/`; add a blank line at the end; save.
2. Run: `skills-repo run next`.

**Expected:** command exits with code 5 (non-zero). stderr names the tampered file and prints both hashes (expected vs computed). No skill runs. Fix: `git checkout` the file, or re-run `init`.

## Scenario 4 — Missing file blocks execution (AC4)

1. Delete any one file under `.skills-repo/standards/`.
2. Run: `skills-repo run next`.

**Expected:** exit code 4. Error names the missing file. Does NOT attempt to re-fetch; does NOT run any skill.

## Scenario 5 — Missing lockfile points to recovery (AC6)

1. `rm .skills-repo/lock.json`.
2. Run: `skills-repo run next`.

**Expected:** exit code 3. Error suggests running `skills-repo init` (or `upgrade`). No skill runs.

## Scenario 6 — Branch-ref warning on verify (AC5)

1. After `init`, open `.skills-repo/lock.json` and change `source.refKind` from `"tag"` to `"branch"`.
2. Run: `skills-repo run next`.

**Expected:** exit 0. stderr contains a WARN line about branch refs. Skill still runs normally.

## Reset

`rm -rf .skills-repo artefacts && skills-repo init --yes` between scenarios.
