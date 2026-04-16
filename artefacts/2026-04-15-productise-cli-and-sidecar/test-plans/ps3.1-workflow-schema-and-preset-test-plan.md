# Test Plan: ps3.1 — `workflow.yaml` schema and one real preset

**Story reference:** `stories/ps3.1-workflow-schema-and-preset.md`
**Review:** PASS Run 2 — 1 LOW carried (WARNING observable).
**Framework:** Vitest unit + E2E CLI wrappers.
**AC count:** 6

## Test data strategy
**Type:** Mixed. Synthetic `workflow.yaml` variants for schema validation tests; fixtures for the `story-unit-min` preset (bundled with package as built-in content).
**PCI / sensitivity:** None.

## WARN observable contract (resolves review LOW 1-L1)

When `workflow.yaml` is invalid but execution is not blocked:
- exit code: 0
- stderr contains a line starting with `WARN:` followed by a human-readable message
- `.skills-repo/traces/` gets a line with `severity: "warning"`, `message: "<same text>"`

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | Unit | `preset-story-unit-min-passes-schema` |
| AC2 | Integration | `run-next-resolves-first-satisfied-step` |
| AC3 | Integration | `run-next-skips-completed-steps` |
| AC4 | E2E | `external-step-exits-2-and-mark-step-done-advances` |
| AC5 | Integration | `invalid-workflow-warns-but-does-not-block` |
| AC6 | Integration | `sigint-leaves-sidecar-in-consistent-state` |

## Unit tests

- **`preset-story-unit-min-passes-schema`** (AC1) — load bundled preset file; validate against schema; assert 5 steps, all required fields present, no unknown top-level keys.
- **`schema-rejects-missing-skill-field`** (AC1) — synthetic workflow with step missing `skill` field; assert schema validation fails with a field-specific error.
- **`step-selector-picks-first-satisfied`** (AC2) — pure function test: given workflow + fake state (what's produced), assert the next-step selector returns the expected step slug.

## Integration tests

- **`run-next-resolves-first-satisfied-step`** (AC2) — fresh sidecar, no artefacts; stub the `definition` skill to record invocation; run `run next`; assert `definition` was called, its `produces` files now exist.
- **`run-next-skips-completed-steps`** (AC3) — pre-create the `definition` output file; run `run next`; assert `definition` was NOT called, next step (`test-plan`) was called.
- **`external-step-exits-2-and-mark-step-done-advances`** (AC4) — arrange state so `implement` (external) is next; run `run next`; assert exit 2; run `skills-repo artefact <slug> mark-step-done implement`; run `run next` again; assert next step after `implement` runs.
- **`invalid-workflow-warns-but-does-not-block`** (AC5) — write a `workflow.yaml` with a step that declares `requires: [nonexistent-step]`; run `run next`; capture stderr; assert WARN line matches contract above; assert exit 0 (execution proceeds per relaxed MVP rule).
- **`sigint-leaves-sidecar-in-consistent-state`** (AC6) — start a skill execution in a child process; SIGINT after first write; restart `run next`; assert state is loadable, no half-written state file, resume works.

## NFR tests

- **`run-next-starts-skill-within-2-seconds`** (NFR performance) — time from `run next` invocation to first output line; assert < 2 s.
- **`state-writes-are-atomic`** (NFR reliability) — fuzz: crash between state-file rename events; on restart, state is always valid JSON.
- **`step-execution-trace-captured`** (NFR audit) — after one `run next`, assert trace entry contains `step`, `skill`, `skillHash`, `status`, `startedAt`, `completedAt`.

## Gap table

No gaps beyond the carried LOW (resolved here in the WARN observable contract).
