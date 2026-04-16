# Review Report: ec1.6 Migrate src/suite-parser/ → cli/src/engine/suite/ — Run 1

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec1.6-suite-parser-migration.md`
**Date:** 2026-04-16
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

None.

## LOW findings — note for retrospective

- **1-L1** (C — AC quality) — AC4 says "the only matches are in documentation / decisions.md / discovery.md / changelog narrative." "Documentation" is imprecise — could tighten to an explicit file-extension filter (`-- "*.md"`) or a whitelist of paths (`artefacts/`, `docs/`, `*.md`). Today a false positive in an executable file with a narrative comment would pass. Tighten at `/test-plan`.
- **1-L2** (C — AC quality) — AC5 treats "test count + pass rate match pre-migration exactly" as the invariant. Edge case: a test previously skipped (e.g. Docker-gated, OS-gated) that now runs under different infrastructure would register a count change. Worth clarifying in `/test-plan`: "expected test names match exactly; pass rate on run tests matches" instead of conflating count + pass-rate into a single check.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS |
| Scope integrity | 5 | PASS |
| AC quality | 4 | PASS |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 0 MEDIUM, 2 LOW.
**Outcome:** PASS — LOWs carried to `/test-plan`.
