# DoR Contract Proposal: Add CONTRIBUTING.md at repo root

**Story:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.1-contributing-md.md`
**Date:** 2026-04-17
**Status:** Reviewed ✅ — aligns with all 4 ACs (AC1, AC1a, AC2, AC3).

---

## What will be built

1. A new `CONTRIBUTING.md` file at the repo root with 7 subsections matching the AC1 enumeration:
   1. Scope ownership (the 5-row ownership table from 006 Part 2)
   2. Proposing changes to `product/*`
   3. Proposing changes to `standards/*` or `SKILL.md`
   4. Code changes under scope ownership
   5. Branching + release
   6. In-flight-work signalling (WIP GitHub-issue convention)
   7. Pipeline-state coordination — **included only if ec3.1 is in-flight or shipped** (see AC1a sequencing guard)
2. A new test validator `tests/check-contributing-md.js` implementing the 4 unit assertions from the test plan (file tracked, 7 keyword markers, scope-ownership 5-of-11 enum, pipeline-state 3-phrase depth).
3. A `package.json` entry adding the validator to the root `npm test` chain.

## What will NOT be built

- **CODEOWNERS file activation.** Per story Out of Scope. Documentation describes ownership; governance wiring is a separate decision.
- **Multi-contributor governance infrastructure** (beyond the two-contributor scale). Per story Out of Scope.
- **Changes to `README.md` or `QUICKSTART.md`.** Per story Out of Scope.
- **Any `SKILL.md`, `standards/`, or `product/` edits.** Different story domains.
- **Enforcement of the scope-ownership table** (e.g. CI hooks that block cross-scope edits). Documentation only for this story.

## How each AC will be verified

| AC   | Test approach | Type |
|------|---------------|------|
| AC1  | Unit tests on `CONTRIBUTING.md` — file tracked by git, 7 topic keyword markers present (heading or bolded bullet), scope-ownership subsection enumerates ≥ 5 of 11 scope tokens, pipeline-state subsection contains `per-artefact` + `featureStatus` + `scanner`. | unit |
| AC1a | Manual at PR time — reviewer checks ec3.1 stage in pipeline-state and confirms subsection 7 is present iff ec3.1 is in-flight or shipped. | manual |
| AC2  | Manual at PR time — reviewer reads the commit message(s) and confirms each changed file has a one-line summary. | manual |
| AC3  | Unit test — `git ls-files CONTRIBUTING.md` returns the path. | unit |

## Assumptions

- **ec3.1 sequencing is enforced at PR-review time**, not by an automated gate. A future improvement could wire a CI check that fails the PR if subsection 7 is present while ec3.1 is not in-flight, but that is not in scope for this story.
- **CONTRIBUTING.md is reviewer-checked for prose fidelity** against 006 Part 2. The test plan asserts structural signals (headings, keyword presence, enumeration); it does not attempt to grade prose quality.
- **No existing CONTRIBUTING.md** at repo root. This is additive. If an earlier CONTRIBUTING file is discovered, the contract expands to an amend rather than a create.

## Estimated touch points

**Files added:**
- `CONTRIBUTING.md` (repo root) — new
- `tests/check-contributing-md.js` — new (or `cli/tests/docs/check-contributing-md.test.ts` if placed under vitest)

**Files modified:**
- `package.json` (root) — add the new validator to the test script chain
- `workspace/learnings.md` may get a one-line entry if any convention learning emerges during implementation (optional; not required by the contract)

**Services:** None.
**APIs:** None.

## Scope contract — do NOT touch

- `SKILL.md` files under `.github/skills/`
- `standards/*` files
- `product/*` files (ec2.2's scope)
- `README.md`, `QUICKSTART.md`
- CI workflow files under `.github/workflows/`

## Sequencing declaration

```yaml
sequencingDepends: ec3.1
reason: subsection 7 (pipeline-state coordination) describes behaviour owned by ec3.1
enforcement: reviewer check at PR time — see AC1a scenario in verification script
```

## Expected diff size

- `CONTRIBUTING.md`: ~200–300 lines (7 subsections with rationale and examples)
- `tests/check-contributing-md.js`: ~80–120 lines
- `package.json`: 1-line edit

Total: ~300–420 lines of additive change. No deletions expected.
