# Review Report: ec2.1 Add CONTRIBUTING.md at repo root — Run 1

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Date:** 2026-04-16
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (C — AC quality) — ~~AC1 reads *"the file contents follow the shape described in `reference/006-engine-consolidation-proposal.md` (for CONTRIBUTING.md — Part 2)."* That's a pointer, not a falsifiable check. Unlike ec2.2 where 006 has literal text blocks to copy, CONTRIBUTING.md's shape in 006 is a prose description listing bullet points ("Scope ownership", "Proposing changes to product/*", "In-flight-work signalling") without verbatim text.~~ **RESOLVED** — AC1 rewritten to enumerate the six required subsections from 006 Part 2, each with the minimum content each subsection must cover, plus a grep-able keyword set for reviewer verification. Stale product/* clause removed (ec2.2 owns that scope).

## LOW findings — note for retrospective

- **1-L1** (C — AC quality) — AC3's `git ls-files` check is a presence test, not a content test. Could combine with AC1's content check.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS |
| Scope integrity | 5 | PASS |
| AC quality | 5 | PASS (after AC1 tightening) |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 1 MEDIUM (resolved in-story), 1 LOW.
**Outcome:** PASS — MEDIUM resolved by rewriting AC1 into an explicit seven-subsection checklist (six from 006 Part 2 + a seventh for pipeline-state coordination added per `decisions.md` Q5). AC1a added as a sequencing guard: subsection 7 is only merged once `ec3.1` ships or is in-flight. No `/decisions` blocker remaining on this story; Q5 decision covers the scope addition transparently.
