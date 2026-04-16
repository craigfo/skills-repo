# Verification Script: ps2.3 — Cross-machine hash round-trip

## Setup

1. On your primary machine (macOS or Linux).
2. Docker installed and running.
3. A test git repo with `skills-repo` installed from ps2.1/ps2.2.

## Scenario 1 — Round-trip passes (AC1, AC3)

1. Run: `scripts/round-trip-test.sh` (or `npm test`).

**Expected:** script runs for ≤5 minutes. At the end, a single line like `✅ round-trip: 47/47 files matched; primary=darwin/node-20, secondary=node:20-alpine@sha256:<digest>`. Exit code 0.

## Scenario 2 — Tampered file is caught (AC2)

1. Manually edit a file in the running secondary container (or use the `--force-tamper` debug flag if provided): e.g. `docker run ... sh -c 'echo hi >> /work/.skills-repo/skills/definition/SKILL.md'`.
2. Re-run the script.

**Expected:** exit non-zero. Output shows which file differs, expected hash, actual hash, and a short diff of first/last bytes. The run is loud, not silent.

## Scenario 3 — npm test wires it in (AC4)

1. Run: `npm test`.

**Expected:** the test output includes the round-trip pass/fail line alongside unit test output. A failure in the round-trip fails the whole test run.

## Scenario 4 — Evidence file is captured (AC5)

1. After a clean pass, open the evidence file (path documented in the story; likely `workspace/round-trip-evidence.md` or similar).

**Expected:** the file lists primary OS + node version, secondary container image + digest, source ref, lockfile hash. Re-running the test regenerates the file with a new timestamp but otherwise matching content.

## Reset

None required — the script cleans up its own container.
