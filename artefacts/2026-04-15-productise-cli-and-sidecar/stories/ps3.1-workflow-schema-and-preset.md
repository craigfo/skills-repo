## Story: `workflow.yaml` schema and one real preset; `run next` resolves steps against the preset

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-3-workflow-and-commands.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **replace the hard-coded single-step workflow from ps1.1 with a real `workflow.yaml` schema + one bundled preset (`story-unit-min`), and have `run next` resolve the next step from the preset against current state**,
So that **the CLI drives a real chain of skills (not a single stub), M2 (time-to-first-artefact) can be measured, and M3 (resume-after-pause) has a chain to resume through**.

## Benefit Linkage

**Metric moved:** M2 — Time-to-first-artefact. M3 — Resume-after-pause works.
**How:** A real workflow + preset is the UX path whose wall-clock time is measured for M2. Resume (M3) requires a multi-step chain with a checkpoint; this story creates that chain.

## Architecture Constraints

- Preset `story-unit-min` chain: `definition → test-plan → definition-of-ready → implement (external) → definition-of-done`. Shorter than today's full outer loop to keep MVP narrow.
- Each step declares: `skill` (identifier resolved against `.skills-repo/skills/`), `produces` (path under `artefacts/<slug>/`), optional `requires` (prior steps), optional `external: true`.
- `workflow.yaml` schema is documented in the package (human-readable) and validated at load time (JSON Schema or equivalent) — but step-level prerequisite enforcement (skill-author declared `needs`) is explicitly OOS per discovery #10.
- Progression check only: `run next` picks the first step whose `requires` are satisfied and whose `produces` file is absent.
- C15 applies — SKILL.md bodies must not reference the CLI's internal paths; the CLI resolves skill identifiers to content, not vice versa.

## Dependencies

- **Upstream:** `ps2.1`, `ps2.2` DoD-complete — skills must be fetched and hash-verified before they can be loaded by `run next`.
- **Downstream:** `ps3.2` (`status` reports position against this workflow); `ps3.3` (dogfood run exercises the full chain).

## Acceptance Criteria

**AC1:** Given `init` has produced `.skills-repo/workflow.yaml` from the `story-unit-min` preset, Then the file validates against the documented workflow schema (no missing required fields, no unknown top-level keys) and contains the five steps named above.

**AC2:** Given a fresh sidecar with no artefacts yet, When the operator runs `skills-repo run next`, Then the CLI resolves the first step whose `requires` are satisfied (initially `definition`), loads the corresponding SKILL.md body from `.skills-repo/skills/definition/SKILL.md`, drives the interaction, and writes the produced file(s) to `artefacts/<slug>/`.

**AC3:** Given the previous step produced the file named in its `produces` field, When `run next` is invoked again, Then the CLI skips the prior step (its `produces` file exists) and resolves the next step whose `requires` are satisfied.

**AC4:** Given a step has `external: true` set, When the CLI reaches it, Then the CLI prints a message naming the step and exits with status 2 ("progression checkpoint — external action required"); the next `run next` invocation treats the step as satisfied only if the operator has explicitly acknowledged completion via `skills-repo artefact <slug> mark-step-done <step>` (defined here for this story).

**AC5:** Given `workflow.yaml` has been hand-edited to remove a required step or reorder steps in a way that violates `requires`, When `run next` is invoked, Then the CLI emits a WARNING naming the validation issue, does NOT block execution (composition validation is OOS per discovery #10), but writes the warning to the trace.

**AC6:** Given a step is executing and the CLI process is interrupted (SIGINT / terminal closed), Then state is written to `.skills-repo/state/` at phase boundaries so that the next `run next` invocation resumes from the last clean checkpoint (basis for M3 in ps3.2 validation).

## Out of Scope

- Multiple built-in presets — `story-unit-min` only at MVP.
- Custom-authored workflows beyond hand-edited `workflow.yaml` — MVP allows hand-edit with warnings but no validated custom path.
- `workflow validate` command refusing invalid sequences — per discovery Out of Scope #10.
- External approval channel integration — all external steps are acknowledged by the operator, not by a channel adapter.

## NFRs

- **Performance:** `run next` resolves the next step and begins skill interaction within 2 seconds on a preset of ≤20 skills.
- **Reliability:** State writes at phase boundaries are atomic (write to temp, rename) so that interrupted runs leave the sidecar in a consistent state.
- **Audit:** Each step execution writes `{step, skill, skillHash, status, startedAt, completedAt}` to `.skills-repo/traces/`.

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
