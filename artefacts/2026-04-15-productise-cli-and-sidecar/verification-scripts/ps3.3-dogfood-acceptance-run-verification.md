# Verification Script: ps3.3 — Dogfood acceptance run

**Audience:** operator (primary actor). This IS the dogfood run.

## Setup

1. Choose a directory **not inside** `skills-repo-productisation/`. For example: `~/sandbox/ps3-dogfood/`.
2. `mkdir` it; `cd` into it; `git init`.
3. Install the CLI: `npm i -g skills-repo@<mvp-tag>` (or your preferred documented path).
4. Note the start time — this is the M2 clock start.

## Scenario 1 — Full chain end-to-end (AC1, AC2)

1. Run: `skills-repo init --preset=story-unit-min --yes`.
2. Run: `skills-repo artefact new ps3-test`.
3. Run: `skills-repo run next`. Work through each interactive step.
4. At `implement` (external step): write whatever the step represents (for the dogfood run, this can be a stub commit).
5. `skills-repo artefact ps3-test mark-step-done implement`.
6. Run: `skills-repo run next` again to reach `definition-of-done`.
7. Note the timestamp of the first artefact file appearing in `artefacts/ps3-test/` — that's M2's stop-clock.

**Expected:** all five steps produce their `produces` files. M2 = stop-clock − start-clock is < 30 min (minimum signal; target < 15).

## Scenario 2 — Host repo is clean (AC3) 🔴

1. In the dogfood repo: `git status --porcelain`.

**Expected:** every line starts with `?? .skills-repo/` or `?? artefacts/`. If you see anything else — loud failure. M1 broken.

## Scenario 3 — Resume after pause (AC4)

1. Close the terminal in the middle of a run (ideally after completing one or two steps).
2. Wait ≥24h (real calendar time), OR edit `.skills-repo/state/last-activity` to 24h ago.
3. Reopen: `skills-repo status`. Read it.
4. Run: `skills-repo run next`.

**Expected:** status shows the correct next step; `run next` resumes where you left off.

## Scenario 4 — Incidents file review (AC5)

1. Open `workspace/productisation-incidents.md` in this repo (the tooling repo, not the dogfood repo).

**Expected:** empty, or ≤1 entry with a documented workaround. Any entry should be a `{date, tension(1|2|3), summary, resolution}` row.

## Scenario 5 — Cross-machine round-trip on the dogfood lockfile (AC6)

1. Copy `artefacts/ps3-test/.skills-repo/lock.json` from the dogfood repo into the ps2.3 test harness.
2. Run: `scripts/round-trip-test.sh`.

**Expected:** pass. If not — MVP does not ship (per Q4 decision).

## Capture

After all scenarios, capture evidence in the DoD artefact:
- Start/stop timestamps for M2
- `git status --porcelain` output
- Contents of `workspace/productisation-incidents.md`
- Round-trip script output
- All `.skills-repo/traces/*.jsonl` from the dogfood repo (copy into DoD evidence folder)
