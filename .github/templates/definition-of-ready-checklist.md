# Definition of Ready Checklist

<!--
  USAGE: Final gate before a story is assigned to the coding agent.
  Produced by the /definition-of-ready skill.
  A story that fails any HARD BLOCK item does not proceed.
  A story that fails a WARNING item proceeds with the risk noted.

  To evolve this checklist: update this file, open a PR, 
  tag engineering lead + QA lead + BA lead.
-->

## Definition of Ready: [Story Title]

**Story reference:** [Link]
**Test plan reference:** [Link]
**Assessed by:** [Copilot / human]
**Date:** [YYYY-MM-DD]

---

## Hard Blocks
<!-- Any FAIL here stops the story. Do not assign to coding agent. -->

| Check | Status | Notes |
|-------|--------|-------|
| Story has a user story in As/Want/So format | ✅ / ❌ | |
| All ACs are in Given/When/Then format | ✅ / ❌ | |
| Every AC is independently testable | ✅ / ❌ | |
| Out of scope is declared (not "N/A") | ✅ / ❌ | |
| Benefit linkage is written and references a metric | ✅ / ❌ | |
| Test plan exists and covers all ACs | ✅ / ❌ | |
| No AC coverage gaps in test plan | ✅ / ❌ | |
| No upstream story dependency is incomplete | ✅ / ❌ | |
| Discovery artefact is approved | ✅ / ❌ | |
| Benefit-metric artefact is active | ✅ / ❌ | |

---

## Warnings
<!-- WARN items allow the story to proceed, but risk must be acknowledged. -->

| Check | Status | Risk if proceeding | Acknowledged by |
|-------|--------|--------------------|-----------------|
| NFRs are identified (or explicitly "None") | ✅ / ⚠️ | Missing NFRs may cause rework post-implementation | |
| Complexity is rated | ✅ / ⚠️ | Unrated complexity makes agent session scoping difficult | |
| Human oversight level is set on parent epic | ✅ / ⚠️ | Coding agent may proceed further than intended | |
| Scope stability is declared | ✅ / ⚠️ | Unstable scope may invalidate test plan mid-implementation | |
| Test plan has no unmitigated gaps | ✅ / ⚠️ | Gaps increase risk of defects reaching PR review | |

---

## Coding Agent Instructions

<!--
  Populated only if all hard blocks pass.
  Specific instructions for the coding agent for this story.
  Overrides or supplements the copilot-instructions.md defaults.
-->

```
## Coding Agent Instructions

Proceed: Yes
Story: [story title] — [path to story artefact]
Test plan: [path to test plan artefact]

Goal:
Make every test in the test plan pass. Do not add scope, behaviour, or
structure beyond what the tests and ACs specify.

Constraints:
- [Language, framework, and conventions from copilot-instructions.md]
- [Files, layers, or components explicitly out of scope for this story]
- Architecture standards: read `.github/architecture-guardrails.md` before
  implementing. Do not introduce patterns listed as anti-patterns or violate
  named mandatory constraints or Active ADRs. If the file does not exist,
  note this in a PR comment.
- Open a draft PR when tests pass — do not mark ready for review
- If you encounter an ambiguity not covered by the ACs or tests:
  add a PR comment describing the ambiguity and do not mark ready for review

Oversight level: [Low / Medium / High]
```

---

## Sign-off

<!--
  For High oversight stories: human sign-off required before assigning to agent.
  For Medium: engineering lead awareness required.
  For Low: no sign-off required — proceed directly.
-->

**Oversight level:** [Low / Medium / High]
**Sign-off required:** [Yes / No]
**Signed off by:** [Name / "Not required"]
