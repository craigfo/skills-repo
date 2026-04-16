# Test Plan: ps3.3 — Dogfood acceptance run

**Story reference:** `stories/ps3.3-dogfood-acceptance-run.md`
**Review:** PASS Run 2 — 1 LOW carried (install-path generalisation).
**Framework:** Manual (human-executed) acceptance run + automated post-run checks. Not an automated Vitest story — the human operator is the test subject per the dogfood-first decision (Q2).
**AC count:** 6

## Test data strategy
**Type:** Fixtures — the test repo is created fresh by the operator; CLI fetches skills from the ps2.1 fixture ref. Expected end-state is checked via scripted post-run assertions.
**PCI / sensitivity:** None.

## Install-path generalisation (resolves review LOW 1-L1)

Acceptable install paths, any of which satisfies AC2:
- `npm i -g skills-repo@<mvp-tag>` (primary documented path)
- `npx skills-repo@<mvp-tag>` (no-install path)
- `npm i -D skills-repo@<mvp-tag>` with invocation via `npx skills-repo` or `./node_modules/.bin/skills-repo`

M2 measurement: wall-clock from install command start to first artefact committed under `artefacts/<slug>/`, whichever install path is used.

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | Manual + scripted check | `full-chain-end-to-end-on-dogfood-repo` |
| AC2 | Manual (M2 measurement) | `time-to-first-artefact-measured-and-recorded` |
| AC3 | Scripted check | `git-status-shows-only-sidecar-and-artefacts-post-run` |
| AC4 | Manual + scripted check | `resume-after-24h-pause-completes-chain` |
| AC5 | Manual | `incidents-file-reviewed-at-close` |
| AC6 | Automated | `round-trip-rerun-on-dogfood-lockfile-passes` |

## Scripted post-run assertions (run after manual steps)

- **`full-chain-end-to-end-on-dogfood-repo`** (AC1) — script: for each step in `story-unit-min`, assert its `produces` file exists in `artefacts/<slug>/`; assert the sequence is in the expected order (by comparing trace timestamps).
- **`git-status-shows-only-sidecar-and-artefacts-post-run`** (AC3) — `git status --porcelain` on dogfood repo; assert no paths outside `.skills-repo/`, `artefacts/`, `.gitignore`.
- **`round-trip-rerun-on-dogfood-lockfile-passes`** (AC6) — copy dogfood `.skills-repo/lock.json`; run ps2.3 harness against it; assert pass.

## Manual measurements

- **`time-to-first-artefact-measured-and-recorded`** (AC2) — operator records timestamps: install start, `init` done, first `run next` done, first artefact present in `git status`. Computes delta. Records in DoD artefact.
- **`resume-after-24h-pause-completes-chain`** (AC4) — operator pauses mid-chain; waits ≥24h real-world OR sets `.skills-repo/state/last-activity` back by 24h; resumes. Records whether resume worked.
- **`incidents-file-reviewed-at-close`** (AC5) — operator reviews `workspace/productisation-incidents.md`; confirms zero or ≤1 entry with documented workaround. Annotates in DoD.

## NFR tests

- No NFR-specific automated tests for this story — the dogfood run is itself the NFR exercise. Trace preservation (all `.skills-repo/traces/` from the dogfood repo committed alongside the DoD) is the only audit NFR and is verified as part of AC1.

## Gap table

| Gap | Handling |
|---|---|
| LOW 1-L1 (install path generalisation) | Addressed above: multiple install paths accepted for AC2 |
| Windows parity for dogfood run | Not covered — operator runs on macOS/Linux only; Windows is post-MVP per discovery |
