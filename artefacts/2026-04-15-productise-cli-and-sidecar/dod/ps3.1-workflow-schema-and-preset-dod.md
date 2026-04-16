# Definition of Done: ps3.1 — Workflow schema + preset + resolver

**Status:** COMPLETE
**Date:** 2026-04-15

## AC verification
| AC | Test | Result |
|---|---|---|
| AC1 schema + 5-step preset | `workflow.test.ts: AC1` | ✅ |
| AC2 resolver picks first satisfied + scaffolds produces | `workflow.test.ts: AC2` | ✅ |
| AC3 completed steps skipped | `workflow.test.ts: AC3` | ✅ |
| AC4 external step exit 2 + mark-step-done advances | `workflow.test.ts: AC4` | ✅ |
| AC5 invalid workflow WARN non-blocking | `workflow.test.ts: AC5` | ✅ |
| AC6 atomic state writes (no .tmp leak) | `workflow.test.ts: AC6` | ✅ |

## Tests
- `cli/ npm test`: **42 unit/integration + round-trip**; all green.
- Typecheck: clean.
- Skills-repo root `npm test`: 23/23.

## Metric signals
- **M2 time-to-first-artefact** — 🟢 end-to-end chain now exists from init → run → artefact.
- **M3 resume-after-pause** — 🟡 state checkpoints in place; `status` surface lands in ps3.2.

## Scope deviations
None material. "Real" skill execution = scaffold the produces file pre-populated with the fetched SKILL.md body (dogfood-appropriate; the operator drives completion).

## Architecture compliance
- ✅ C13 structural: resolver is a pure function; atomic state writes via temp+rename; validation is advisory (MVP OOS #10) but loud.
- ✅ C15 outcome-oriented: SKILL.md bodies are content, not code — CLI orchestrates, operator executes.
- ✅ Guardrail MC-CLI-01 still honoured (writes are all under `.skills-repo/` or `artefacts/`).

## Evidence
- `cli/src/engine/workflow.ts`, `cli/src/commands/artefact.ts`, modified `cli/src/commands/run.ts`, `cli/src/engine/sidecar.ts`, `cli/src/cli.ts`, `cli/package.json` (+ js-yaml), `cli/tests/workflow.test.ts`.
