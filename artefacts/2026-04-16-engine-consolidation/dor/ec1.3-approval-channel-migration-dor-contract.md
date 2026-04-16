# DoR Contract Proposal: Migrate src/approval-channel/ → cli/src/adapters/approval-channel/

**Story:** `artefacts/2026-04-16-engine-consolidation/stories/ec1.3-approval-channel-migration.md`
**Date:** 2026-04-17
**Status:** Reviewed ✅ — aligns with all 6 ACs.

---

## What will be built

A move-only refactor relocating the approval-channel subcomponent and its test(s) from `src/` into the CLI's authoritative layout:

1. `git mv src/approval-channel/** cli/src/adapters/approval-channel/**` — all 1 subfile (index.js).
2. `git mv tests/check-dor-approval.js` → `cli/tests/adapters/approval-channel/` — the 1 associated test file.
3. Rewrite imports inside the moved test file: any `require('…src/approval-channel…')` or `import … from '…src/approval-channel…'` → new path (or relative from the test's new location).
4. Update `package.json` root test chain: replace the old invocation path with the new one so `npm test` still runs the moved test.
5. Add a new vitest file at `cli/tests/adapters/approval-channel/migration-invariants.test.ts` implementing the 5 unit/integration/NFR assertions from the test plan.

## What will NOT be built

- **Any behaviour change to approval-channel.** Interfaces, return shapes, and external calls are preserved verbatim. A ticket to improve readability or modernise the code is a separate feature.
- **Rewriting the existing test(s)** (check-dor-approval.js). They move verbatim; only import paths change.
- **SKILL.md / standards content** that references approval-channel. The CLI provides a stable external API shape; references to the subcomponent continue to read correctly.
- **`.github/scripts/` collapse** beyond the one co-located test file. Per /decisions Q3, that is a separate feature.

## How each AC will be verified

| AC | Test approach | Type |
|----|---------------|------|
| AC1 | Manual — operator runs existing test(s), transcribes exit code + function count + assertion count into DoD `pre-migration-tests` block before any git mv. | manual |
| AC2 | Unit — vitest assertion: `fs.readdirSync('src/approval-channel', { recursive: true })` filtered to .js/.ts has length 0. | unit |
| AC3 | Unit — vitest assertions on `fs.existsSync()` for each expected file + regex scan of moved test file(s) for any remaining old-path imports. | unit |
| AC4 | Unit — programmatic grep over .js/.ts/.mjs/.cjs excluding node_modules/.git/artefacts. | unit |
| AC5 | Integration — run moved test(s) at new path, capture exit code + counts, diff against AC1's DoD block. | integration |
| AC6 | Manual — reviewer checks PR body at /review / DoD. | manual |

## Assumptions

- **Git history preservation:** `git mv` preserves `git log --follow` history. If the operator uses `rm` + `add` instead, the audit NFR test fails — the contract assumes the correct tool is used.
- **Pre-existing test stability:** The test currently under tests/check-dor-approval.js run to a stable exit code and test-count at HEAD. If the test is flaky pre-migration, the "exactly match" AC5 invariant becomes unreliable — a pre-existing flake must be stabilised or captured in the AC1 snapshot with explicit acknowledgement.
- **Package.json script chain reachability:** The root `npm test` invokes this test via a `node <path>` entry in the script chain. Updating the path is a one-line edit; if the invocation uses a globbing pattern or a different runner, the contract expands to cover that adaptation.
- **Parallel branches merge cleanly:** Per /decisions Q1, the 7 migration stories run on parallel branches. The contract assumes no two branches touch the same file (enforced by the disjoint subcomponent boundaries).

## Estimated touch points

**Files moved (git mv):**
- src/approval-channel/index.js → cli/src/adapters/approval-channel/index.js
- tests/check-dor-approval.js → cli/tests/adapters/approval-channel/check-dor-approval.js

**Files modified:**
- `package.json` (root) — test script chain path update
- cli/tests/adapters/approval-channel/check-dor-approval.js — import rewrites inside moved test

**Files added:**
- `cli/tests/adapters/approval-channel/migration-invariants.test.ts` — new vitest file implementing the test plan's unit/integration/NFR assertions

**Services:** None (build-time only).
**APIs:** None (no runtime behaviour change).

## Scope contract — do NOT touch

- Other `src/*` subcomponents (each owned by a separate ec1.x story)
- Runtime code paths in cli/src/adapters/approval-channel/ beyond import rewrites in the moved tests
- Any `.github/skills/*/SKILL.md` files
- Any file under `standards/` or `product/`
- `.github/scripts/` validators other than the one co-located test
- `cli/cli.ts` or `cli/src/commands/*` (command surface is stable)

## Expected diff size

Move-only; diff should be dominated by `git mv` renames (nearly-zero content change) plus:
- ≤ 5 lines in `package.json` (one script chain path)
- A handful of import-rewrite lines in the moved test (count depends on how many imports reference the old path)
- `migration-invariants.test.ts` (~80–120 lines of test code)

If the non-rename diff exceeds ~200 lines, the contract is being exceeded — stop and raise a PR comment.
