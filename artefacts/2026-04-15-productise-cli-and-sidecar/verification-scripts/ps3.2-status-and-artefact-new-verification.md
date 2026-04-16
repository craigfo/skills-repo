# Verification Script: ps3.2 — `status` and `artefact new`

## Setup

1. Fresh test repo; `git init`; `skills-repo init --yes`.

## Scenario 1 — Status on empty sidecar (AC1)

1. Run: `skills-repo status`.

**Expected:** output names the preset, notes no active feature, suggests `artefact new`. Exit 0.

## Scenario 2 — Create a feature folder (AC3)

1. Run: `skills-repo artefact new my-feature`.
2. `ls artefacts/`.
3. Run: `skills-repo status`.

**Expected:** `artefacts/my-feature/reference/` exists. `status` now names `my-feature` as the active feature and lists the first step as the next step.

## Scenario 3 — Status after partial progress (AC2)

1. Run: `skills-repo run next` and complete the first step.
2. Run: `skills-repo status`.

**Expected:** status correctly identifies the next unfinished step.

## Scenario 4 — Artefact new refuses duplicate slug (AC4)

1. Run: `skills-repo artefact new my-feature` again.

**Expected:** exit non-zero; "already exists" error; nothing changes.

## Scenario 5 — Status flags blocking issue (AC5)

1. Modify one skill file under `.skills-repo/skills/` (add a blank line).
2. Run: `skills-repo status`.

**Expected:** exit 1 (non-zero). Output names the hash mismatch and suggests `skills-repo init` to re-fetch.

## Scenario 6 — After-pause activity signal (AC6)

1. Simulate time passage: set `.skills-repo/state/last-activity` to 2 days ago (or wait).
2. Run: `skills-repo status`.

**Expected:** output includes "Last activity: 2 days ago" (or similar).
