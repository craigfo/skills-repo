# DoR Contract Proposal: Apply product/* edits (roadmap + tech-stack + decisions ADR)

**Story:** `artefacts/2026-04-16-engine-consolidation/stories/ec2.2-product-edits.md`
**Reference:** `artefacts/2026-04-16-engine-consolidation/reference/006-engine-consolidation-proposal.md` — "Proposed product/* edits" section
**Date:** 2026-04-17
**Status:** Reviewed ✅ — aligns with all 3 ACs; AC1 tightness handled at /test-plan.

---

## What will be built

1. Append to `product/roadmap.md` — a section titled "Productisation thread (started 2026-04-15)" matching the shape of 006's roadmap block (names the distribution outcome, links to productise-cli-and-sidecar artefact, references engine-consolidation).
2. Amend `product/tech-stack.md` — add a section "Engine layout (post-consolidation target)" with a tree diagram listing `cli/src/commands/`, `cli/src/engine/`, `cli/src/adapters/`, `cli/src/agents/`, `.github/workflows/`, `.github/scripts/`, and `src/` marked DEPRECATED.
3. Append to `product/decisions.md` — an ADR `ADR-<N>: CLI is the single authoritative control plane` where N is the next available ADR number. Must include Status, Date, Context, Options considered (≥ 3 rows), Decision, Consequences.
4. Add `tests/check-product-edits.js` — validator implementing the 4 unit assertions (git-tracked on all 3 files + 3 block-presence content assertions).
5. Update `package.json` root test chain to include the validator.

## What will NOT be built

- **Any edits to `product/mission.md` or `product/constraints.md`.** Protected by C4 / C13 — out of scope per story.
- **Changes to `standards/*` files.** Different governance domain.
- **Future productisation roadmap entries.** Only the initial Productisation-thread paragraph lands here.

## How each AC will be verified

| AC  | Test approach | Type |
|-----|---------------|------|
| AC1 | Three unit checks (one per block) — roadmap has Productisation-thread heading + artefact reference; tech-stack has Engine-layout heading + 4 cli/src path tokens + DEPRECATED marker; decisions.md has ADR heading + Status Accepted + "move-only" phrase. | unit |
| AC2 | Manual at PR — reviewer reads commit message(s), confirms per-file one-line summaries. | manual |
| AC3 | Unit check — `git ls-files` returns all 3 files post-commit. | unit |

## Assumptions

- **No existing "Productisation thread" section in roadmap.md.** The contract is additive. If a draft already exists, the contract expands to a reconcile.
- **No existing "Engine layout" section in tech-stack.md.** Additive. Contract expands if present.
- **Next ADR number is operator-chosen.** The test plan's regex `/ADR-d+/` accepts any numeric ID.
- **Prose fidelity is reviewer-judged.** The test plan's keyword-presence checks are necessary but not sufficient — reviewer confirms the landed prose says what 006 says (already reviewed once at story time).

## Estimated touch points

**Files modified:**
- `product/roadmap.md` — append ~10-line section
- `product/tech-stack.md` — amend / append ~15-line subsection
- `product/decisions.md` — append ~40-line ADR
- `package.json` (root) — one-line test chain addition

**Files added:**
- `tests/check-product-edits.js` — new validator (~100 lines)

**Services:** None.
**APIs:** None.

## Scope contract — do NOT touch

- `product/mission.md`
- `product/constraints.md`
- Any `standards/*` file
- Any `SKILL.md` under `.github/skills/`
- `CONTRIBUTING.md` (ec2.1's scope)

## Expected diff size

- `product/roadmap.md`: +10 lines
- `product/tech-stack.md`: +15 lines
- `product/decisions.md`: +40 lines (full ADR)
- `tests/check-product-edits.js`: +~100 lines
- `package.json`: +1 line

Total: ~165 lines of additive change.
