# Review Report: ps3.1 workflow.yaml schema and one real preset — Run 1

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps3.1-workflow-schema-and-preset.md`
**Date:** 2026-04-15
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (B — Scope discipline) — AC4 introduces a new sub-command: `skills-repo artefact <slug> mark-step-done <step>`. This sub-command is not named in discovery MVP items 1–8 (which list the primitives: CLI package / `init` / `workflow.yaml` schema / `run next` / `status` / fetch at init / `lock.json` / local-only). Adding it here without a scope note is silent scope expansion. It may be necessary (external steps need a progression mechanism) but needs to be declared.
  Risk if proceeding: scope accumulator Step 6 reported "0 scope additions approved via scope note" — this finding invalidates that count. If unacknowledged, further sub-commands can accrete the same way.
  Fix: EITHER (a) log a SCOPE entry in `decisions.md` naming `mark-step-done` as an approved MVP addition with rationale ("required to make `external: true` steps progressable without manual state file edits"); OR (b) revise AC4 so external-step progression is achieved via re-running `run next` with `--mark-done` as a flag on an existing command rather than a new sub-command.

## LOW findings — note for retrospective

- **1-L1** (C — AC quality) — AC5 defines behaviour when `workflow.yaml` is hand-edited incorrectly: *"the CLI emits a WARNING… does NOT block execution"*. The word "WARNING" is a convention; the AC doesn't specify the observable (stderr? exit code?). Tighten in `/test-plan` to: "exit code 0; non-empty stderr with a line starting `WARN:`; line written to trace file with `severity: warning`."

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS |
| Scope integrity | 3 | PASS |
| AC quality | 4 | PASS |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 1 MEDIUM, 1 LOW.
**Outcome:** PASS — 1 MEDIUM must be resolved or acknowledged (`mark-step-done` scope note).
