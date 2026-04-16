# Verification Script: ps3.1 — `workflow.yaml` schema and preset

## Setup

1. Fresh test repo; `git init`; `skills-repo init --preset=story-unit-min --yes`.
2. `cat .skills-repo/workflow.yaml`.

## Scenario 1 — Preset workflow looks right (AC1)

**Expected:** workflow.yaml contains five steps in order: `definition`, `test-plan`, `definition-of-ready`, `implement` (marked `external: true`), `definition-of-done`. Each step has a `skill` field and (except the first) a `requires` list.

## Scenario 2 — First run picks the first step (AC2)

1. Run: `skills-repo run next`.

**Expected:** the `definition` skill starts a conversation. When it finishes, `artefacts/<slug>/` contains the file(s) it produces.

## Scenario 3 — Re-running skips completed steps (AC3)

1. After Scenario 2: `skills-repo run next` again.

**Expected:** the `test-plan` skill runs next — not `definition` again.

## Scenario 4 — External step halts and mark-step-done advances (AC4)

1. Keep running `run next` until `implement` is next.
2. Run: `skills-repo run next`.

**Expected:** CLI prints something like "external step: implement — requires manual completion" and exits with code 2.
3. Do whatever the external step represents (in the dogfood case, write the code or stub).
4. Run: `skills-repo artefact <slug> mark-step-done implement`.
5. Run: `skills-repo run next`.

**Expected:** the next step (`definition-of-done`) starts.

## Scenario 5 — Invalid workflow.yaml warns but doesn't block (AC5)

1. Hand-edit `.skills-repo/workflow.yaml` to remove one `requires` entry.
2. Run: `skills-repo run next`.

**Expected:** stderr shows a line starting `WARN:` naming the composition issue. Command exits 0 and proceeds to run a step (MVP relaxed rule; full validation is post-MVP).

## Scenario 6 — Interrupting doesn't corrupt state (AC6)

1. Start `skills-repo run next`; press Ctrl-C mid-interaction.
2. Run `skills-repo status` then `skills-repo run next`.

**Expected:** status reports a coherent position; `run next` resumes at the last clean checkpoint with prior work intact.
