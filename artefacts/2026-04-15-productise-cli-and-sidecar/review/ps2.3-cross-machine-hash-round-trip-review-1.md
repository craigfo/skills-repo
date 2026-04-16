# Review Report: ps2.3 Cross-machine hash round-trip acceptance test — Run 1

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps2.3-cross-machine-hash-round-trip.md`
**Date:** 2026-04-15
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (C — AC quality) — AC3 is phrased as a procedural list (*"(i) performs `init`… (ii) spawns a clean Docker container… (iii) performs `init`… (iv) diffs hashes… (v) returns a single pass/fail summary"*) rather than Given/When/Then. This describes *implementation of the test harness* rather than *observable behaviour of the story's output*. AC1 and AC2 already capture the observable pass/fail; AC3's procedural content belongs in the test plan or the harness README.
  Risk if proceeding: the test harness shape gets frozen at AC level; if a simpler harness (e.g. a CI matrix rather than a local Docker wrapper) would satisfy the invariant, the AC blocks that path.
  Fix: either reduce AC3 to an observable outcome ("Given the test is invoked with no arguments, When it completes, Then it emits a single-line pass/fail summary to stdout") and move the procedural detail to `/test-plan`; or accept the AC as procedural with a `[Testability: accepted by operator on <date>]` annotation.

## LOW findings — note for retrospective

- **1-L1** (B — Scope) — AC3 allows "Docker container (or equivalent isolated environment)". The "or equivalent" escape clause weakens testability — future reviewers can't tell whether a CI matrix row counts. Consider tightening in `/test-plan`.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS |
| Scope integrity | 5 | PASS |
| AC quality | 4 | PASS |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 1 MEDIUM, 1 LOW.
**Outcome:** PASS — 1 MEDIUM to resolve or acknowledge via `/decisions`.
