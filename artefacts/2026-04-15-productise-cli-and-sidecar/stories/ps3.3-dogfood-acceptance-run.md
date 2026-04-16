## Story: Dogfood acceptance run — one full artefact chain produced via the CLI on a clean test repo

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-3-workflow-and-commands.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **run the full `story-unit-min` chain end-to-end on a clean empty test repo using only the installed CLI, and capture the wall-clock + evidence in the DoD**,
So that **MM1 is validated with real evidence and not an assertion, MM2 (§12-tension incident tracking) gets its first pass, and M2 time-to-first-artefact is measured rather than guessed** (per Q2 dogfood-first decision).

## Benefit Linkage

**Metric moved:** MM1 — Dogfood delivery on packaged CLI (primary); MM2 — No §12-tension incidents during MVP; M2 — Time-to-first-artefact (measurement).
**How:** This story *is* the validation run. It produces the evidence for MM1; its log is the input to MM2; the wall-clock from install to first artefact is the M2 measurement.

## Architecture Constraints

- The test repo is **not** `skills-repo-productisation/` itself (that would conflate dogfood with development environment) — per Q2 decision and discovery Out of Scope #16.
- The CLI used is the installed package (npm global or local), not a source-linked development build (otherwise MM1 measures nothing real).
- `workspace/productisation-incidents.md` is the file where §12-tension incidents are logged during this run; it must be created and reviewed at MVP close.

## Dependencies

- **Upstream:** All of `ps1.1`, `ps2.1`, `ps2.2`, `ps2.3`, `ps3.1`, `ps3.2` DoD-complete. This is the last story in the chain.
- **Downstream:** None (gating story; signals MVP ready for /improve).

## Acceptance Criteria

**AC1:** Given a fresh empty git repo at a path distinct from `skills-repo-productisation/`, When the operator installs the published CLI package and runs the full `story-unit-min` chain (`init` → `artefact new` → `run next` to completion), Then all five steps complete end-to-end; every `produces` file exists in `artefacts/<slug>/`; and the DoD artefact for this story records the sequence of commands invoked and the timestamps at start, first-artefact, and end.

**AC2:** Given AC1 has completed, Then the wall-clock time from `npm i -g skills-repo` to the first committed artefact is under 30 minutes (M2 minimum validation signal); the measured time is recorded in the DoD as the M2 observation.

**AC3:** Given AC1 has completed, Then `git status --porcelain` in the dogfood repo shows only changes under `.skills-repo/` and `artefacts/` (and, if the operator confirmed the prompt, two new lines in `.gitignore`) — M1 satisfied end-to-end.

**AC4:** Given the operator pauses the dogfood run after at least one step has completed, waits at least 24h (or simulates by fast-forwarding state file mtime), runs `skills-repo status`, and then runs `run next`, Then the CLI resumes correctly from the checkpoint and completes the chain (M3 validated).

**AC5:** Given the dogfood run has completed, Then `workspace/productisation-incidents.md` exists in this repo (the tooling repo, not the dogfood repo) and is either empty (ideal) or contains a row per incident with `{date, tension (1|2|3), summary, resolution}`; MM2 target is 0 incidents, minimum signal is ≤1 with a documented workaround.

**AC6:** Given the dogfood run completes and the cross-machine round-trip test from ps2.3 has been re-run using the dogfood repo's lockfile as input, Then both M5 and MM3 are validated; failure = MVP does not ship (per Q4).

## Out of Scope

- External-adopter validation pass — post-MVP (OOS #16).
- Multiple dogfood runs on different OSes as a matrix — one primary machine + one clean environment (the ps2.3 test already provides the second environment for round-trip); full OS matrix is post-MVP.
- Formal UX study / screen recording — an operator's lived-experience log is the evidence; no formal protocol.

## NFRs

- **Performance:** The full dogfood chain is not bound by a specific time NFR beyond M2; expected to take 30–90 minutes of operator time at 50% engagement (matches E1 estimate).
- **Audit:** All trace files under `.skills-repo/traces/` on the dogfood repo are preserved and included in the DoD artefact as evidence.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
