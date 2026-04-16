## Story: `status` and `artefact new` commands

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-3-workflow-and-commands.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **run `skills-repo status` to see current pipeline position and `skills-repo artefact new <slug>` to scaffold a new feature folder**,
So that **the CLI is navigable without memorising state file paths, and M3 (resume-after-pause works) has a primary UX surface** (`status`).

## Benefit Linkage

**Metric moved:** M3 — Resume-after-pause works (primary).
**How:** `status` is the command the operator uses after a pause to reorient; its correctness is what "resume works" means in practice. `artefact new` is secondary — it completes the minimum command surface the dogfood run (ps3.3) needs.

## Architecture Constraints

- `status` reads `.skills-repo/state/` + `workflow.yaml` + `artefacts/<slug>/` presence and computes current step, next step, and any blocking issues (missing lockfile, hash mismatches). It does not fetch or write.
- `artefact new <slug>` creates `artefacts/<slug>/` with the feature-folder skeleton (empty `reference/` subfolder), registers `<slug>` in state as the active feature, but does not run any skill.
- None identified in `.github/architecture-guardrails.md`.

## Dependencies

- **Upstream:** `ps3.1` DoD-complete — `status` reports against a real workflow; `artefact new` assigns the slug that the workflow runs under.
- **Downstream:** `ps3.3` (dogfood run exercises both commands end-to-end).

## Acceptance Criteria

**AC1:** Given a sidecar has been initialised and no artefacts exist yet, When the operator runs `skills-repo status`, Then the CLI prints: active feature (or "none — run `artefact new`"), workflow preset name, current step (or "not started"), next step (or "—"), and any blocking issue (lockfile missing, hash mismatch, etc.).

**AC2:** Given any two steps of the workflow have completed (their `produces` files exist), When `status` is run, Then the output correctly identifies the next `run next` target as the first step whose `requires` are satisfied and whose `produces` file is absent.

**AC3:** Given the operator runs `skills-repo artefact new my-feature`, When the command completes, Then `artefacts/my-feature/` exists with an empty `reference/` subfolder, `my-feature` is recorded as the active feature in state, and subsequent `run next` invocations produce files under `artefacts/my-feature/`.

**AC4:** Given an artefact folder already exists at `artefacts/<slug>/`, When `artefact new <slug>` is re-run with the same slug, Then the CLI exits non-zero with an error ("artefact folder already exists") and does not modify the existing folder or state.

**AC5:** Given `status` detects a blocking issue (e.g. a hash mismatch from a tampered snapshot, or a missing `lock.json`), Then the output includes a named issue and a suggested command to resolve it (e.g. "run `init` to re-fetch"). The exit code is 1 for blocking issues, 0 for clean state.

**AC6:** Given the sidecar state was last modified more than 7 calendar days ago (file mtime), When `status` is run, Then the output includes a note "Last activity: N days ago — resuming" — the informational surface that makes M3 observable.

## Out of Scope

- `status --json` machine-readable output — not needed for MVP dogfood.
- `artefact list` / `artefact rm` — single-feature MVP shape doesn't need them.
- Renaming or moving feature folders — OOS.
- Multi-feature active concurrent work — MVP supports one active feature at a time.

## NFRs

- **Performance:** `status` completes in under 1 second on a sidecar with ≤20 skills and ≤10 artefacts.
- **Audit:** Both commands write a trace entry on execution.
- **Reliability:** Neither command mutates `.skills-repo/skills/` or `.skills-repo/standards/`; a read-side assertion protects this invariant.

## Complexity Rating

**Rating:** 1
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
