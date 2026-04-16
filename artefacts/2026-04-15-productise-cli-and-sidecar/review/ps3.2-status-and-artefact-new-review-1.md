# Review Report: ps3.2 `status` and `artefact new` commands — Run 1

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps3.2-status-and-artefact-new.md`
**Date:** 2026-04-15
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (B — Scope discipline) — The `artefact new` sub-command is not explicitly named in discovery MVP items 1–8. Discovery item 5 lists `status` as a first-class primitive; `artefact new` is introduced only in this story. Same class of finding as ps3.1 1-M1. The sub-command is arguably necessary (operators need a way to scaffold feature folders without hand-creating directory structure) but should be declared.
  Risk if proceeding: same as ps3.1 1-M1 — silent scope expansion, scope accumulator count understated.
  Fix: EITHER (a) log a SCOPE entry in `decisions.md` naming `artefact new` as an approved MVP addition, with rationale ("operators need a one-command scaffold for new feature folders so `run next` has a destination slug"); OR (b) fold the behaviour into `init` (init creates a default starter feature folder and the operator renames later).

## LOW findings — note for retrospective

- **1-L1** (C — AC quality) — AC6 is a display-only assertion (*"output includes a note 'Last activity: N days ago — resuming'"*) tied to mtime. Mtime is fragile across filesystems (copy, rsync, git checkout can reset it). Consider a state-file timestamp field instead of filesystem mtime at `/test-plan`.

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
**Outcome:** PASS — 1 MEDIUM must be resolved or acknowledged (`artefact new` scope note).
