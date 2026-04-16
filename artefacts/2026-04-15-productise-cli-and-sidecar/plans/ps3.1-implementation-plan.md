# Implementation Plan: ps3.1 — workflow.yaml schema + preset

**Branch:** `feature/ps3.1-workflow-schema-and-preset`

## Tasks
1. Add `js-yaml` dep. New `cli/src/engine/workflow.ts`:
   - `STORY_UNIT_MIN_WORKFLOW_YAML` preset body.
   - `parseWorkflow` + `validateWorkflow` (returns WorkflowWarning[] — advisory).
   - `readState` / `writeState` with atomic temp+rename.
   - `resolveNextStep` pure function against `{cwd, slug, workflow, state}`.
   - `loadSkillBody(cwd, skillId)`.
2. New `cli/src/commands/artefact.ts` — `mark-step-done` sub-command.
3. Modify `run.ts`:
   - Hand skeleton mode off to legacy trivial path.
   - Sourced mode: verify → load workflow → resolve → scaffold artefact with SKILL.md body → update state.
   - External step: stdout instructions + exit 2; trace entry `run.external`.
4. Modify `sidecar.ts` to write STORY_UNIT_MIN workflow in sourced mode.
5. Modify `cli.ts` — wire `artefact <slug> mark-step-done <step>` dispatch.
6. 8 workflow.test.ts tests: AC1–AC6 + trace + completion.
