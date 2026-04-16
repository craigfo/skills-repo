# Review Report: ec2.1 Add CONTRIBUTING.md at repo root — Run 2

**Story reference:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Date:** 2026-04-16
**Categories run:** A, B, C, D, E
**Trigger for re-review:** AC1 materially changed (6 → 7 subsections) after decisions Q5 added a pipeline-state coordination requirement; new AC1a sequencing guard introduced tying this story to ec3.1.
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

None. The Q5 decision entry already documents the seventh-subsection scope-add; the sequencing guard (AC1a) ties the doc to the code's existence. No additional `/decisions` entry required from this story.

## LOW findings — note for retrospective

- **2-L1** (C — AC quality) — AC1a says subsection 7 is merged once ec3.1 is *"itself shipped or in-flight on `develop`."* "In-flight" is looser than "merged". Reviewer interpretation could drift: does opening the ec3.1 PR count as in-flight, or does the PR need to be approved, or merged? Suggested tightening at `/test-plan`: "once ec3.1's PR is merged to `develop`". The stronger form removes ambiguity and avoids the scenario where subsection 7 lands while ec3.1 is still under review and might change shape.
- **2-L2** (C — AC quality) — AC1's reviewer grep check names seven keywords, one of which is `Pipeline-state` (capitalised + hyphenated). If the CONTRIBUTING.md author writes "pipeline state" (no hyphen) or "Pipeline state" or "per-artefact state" the grep misses. Suggested tightening at `/test-plan`: use a case-insensitive regex alternation, e.g. `-iE "pipeline[- ]?state|per-artefact state"`, or commit to a canonical heading string in the AC.
- **2-L3** (D — Completeness) — The story's Dependencies section names ec3.1 only as a "Downstream" concern of ec2.1 subsection 7. Bidirectional phrasing would be clearer — ec2.1 depends on ec3.1 for subsection 7 to be truthful (upstream), while ec3.1 does not depend on ec2.1. Re-order in a future touch.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS (references to 006 Part 2 and decisions Q5 both present) |
| Scope integrity | 5 | PASS (scope-add is transparent via Q5; epic-2's story list now flags the seventh subsection and the sequencing dep) |
| AC quality | 5 | PASS (seven falsifiable subsections + explicit sequencing AC; LOW concerns are polish, not substance) |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 0 MEDIUM, 3 LOW.
**Outcome:** PASS — LOWs carry to `/test-plan` for AC phrasing tightening (merged-not-in-flight; regex for subsection keyword).
