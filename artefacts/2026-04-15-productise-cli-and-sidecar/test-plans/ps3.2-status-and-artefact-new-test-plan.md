# Test Plan: ps3.2 — `status` and `artefact new` commands

**Story reference:** `stories/ps3.2-status-and-artefact-new.md`
**Review:** PASS Run 2 — 1 LOW carried (mtime fragility).
**Framework:** Vitest + E2E CLI wrappers.
**AC count:** 6

## Test data strategy
**Type:** Synthetic. Every test creates a fresh sidecar state in setup.
**PCI / sensitivity:** None.

## Resume-window signal (resolves review LOW 1-L1)

AC6 originally used filesystem mtime. Prefer a state-file timestamp field: `.skills-repo/state/last-activity` records ISO-8601 datetime at every state write. `status` reads this field (falling back to mtime if absent for backward compat). Tests here use the state field primarily and mtime only as a secondary path.

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | Integration | `status-on-fresh-sidecar-shows-no-active-feature` |
| AC2 | Integration | `status-reports-correct-next-step` |
| AC3 | Integration | `artefact-new-scaffolds-feature-folder-and-state` |
| AC4 | Integration | `artefact-new-refuses-existing-slug` |
| AC5 | Integration | `status-surfaces-blocking-issues-with-exit-1` |
| AC6 | Integration | `status-shows-last-activity-after-24h` |

## Integration tests

- **`status-on-fresh-sidecar-shows-no-active-feature`** (AC1) — after `init` with no `artefact new`; run `status`; assert output contains "active feature: none — run `artefact new`".
- **`status-reports-correct-next-step`** (AC2) — complete 2 steps (stub skills that write produces files); run `status`; assert reported "next step" matches the first step whose `requires` are satisfied and `produces` absent.
- **`artefact-new-scaffolds-feature-folder-and-state`** (AC3) — run `artefact new my-feature`; assert `artefacts/my-feature/reference/` exists; assert state records `activeFeature: "my-feature"`.
- **`artefact-new-refuses-existing-slug`** (AC4) — create `artefacts/my-feature/`; run `artefact new my-feature`; assert exit ≠ 0, error naming "already exists", state not modified.
- **`status-surfaces-blocking-issues-with-exit-1`** (AC5) — simulate hash mismatch state; run `status`; assert exit 1 and output contains "suggested: run `init` to re-fetch".
- **`status-shows-last-activity-after-24h`** (AC6) — stub `last-activity` timestamp to > 24h ago; run `status`; assert output contains "Last activity: N days ago".

## Unit tests

- **`next-step-selector-matches-run-next`** (AC2) — pure function test: status's next-step logic produces the same answer as `run next`'s selection logic for a given state+workflow.
- **`read-only-command-never-writes`** (read-side invariant) — run `status` under a filesystem watcher; assert no writes to `.skills-repo/skills/` or `.skills-repo/standards/`.

## NFR tests

- **`status-under-1-second`** (NFR performance) — time `status`; assert < 1 s on a 20-skill sidecar.
- **`status-and-artefact-new-write-trace-entry`** (NFR audit) — assert trace entries captured.

## Gap table

| Gap | Handling |
|---|---|
| LOW 1-L1 (mtime fragility) | Resolved in this plan: prefer `.skills-repo/state/last-activity` field; mtime is fallback only |
