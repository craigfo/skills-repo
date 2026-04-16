# Definition of Done: ps1.1 — End-to-end CLI skeleton

**Story:** `stories/ps1.1-end-to-end-cli-skeleton.md`
**Contract:** `dor/ps1.1-end-to-end-cli-skeleton-dor-contract.md`
**Test plan:** `test-plans/ps1.1-end-to-end-cli-skeleton-test-plan.md`
**Date:** 2026-04-15
**Status:** COMPLETE

---

## AC verification

| AC | Verified by | Result |
|----|-------------|--------|
| AC1 — init creates only sidecar + artefacts | `tests/init.test.ts: AC1 creates only .skills-repo/ and artefacts/ on a clean git repo` + `tests/e2e.test.ts: init --yes then run next` | ✅ PASS |
| AC2 — gitignore append | `tests/init.test.ts: AC2 appends two lines to .gitignore when confirmed` + `AC2 appends to an existing .gitignore without disturbing prior lines` | ✅ PASS |
| AC3 — run next executes trivial skill + writes artefact | `tests/run.test.ts: AC3 executes the trivial skill and writes one artefact` + e2e | ✅ PASS |
| AC4 — non-git abort | `tests/init.test.ts: AC4 aborts non-zero when host is not a git repo` + `tests/e2e.test.ts: init aborts non-zero in a non-git directory` | ✅ PASS |
| AC5 — git status clean | `tests/run.test.ts: AC5 git status after full cycle shows only approved paths` + e2e | ✅ PASS |

## Test results

- `cli/ npm test` — **13 passed (13)** across `git.test.ts`, `init.test.ts`, `run.test.ts`, `e2e.test.ts`.
- `cli/ npm run typecheck` — **clean** (no TS errors).
- Skills-repo root `npm test` — **23 passed (23)** (governance checks; includes new guardrail entry MC-CLI-01 in architecture-guardrails.md).

## Metric signals

| Metric | Signal after ps1.1 |
|---|---|
| M1 Sidecar-only footprint | ✅ Enforced end-to-end in AC1 + AC5. E2E test confirms `git status --porcelain` shows only `.skills-repo/`, `artefacts/`, `.gitignore` paths. |
| MM1 Dogfood on packaged CLI | 🟡 Partial — CLI package exists and runs; full dogfood delivery is ps3.3. |
| Other metrics (M2–M5, MM2, MM3) | Not yet measurable — rely on downstream stories. |

## Scope deviations

- **None** — contract-scope implementation matches the DoR contract exactly.
- `mark-step-done` / `artefact new` / workflow-schema not yet implemented (correctly deferred to ps3.x per contract).

## Architecture compliance

- ✅ New guardrail MC-CLI-01 landed in `.github/architecture-guardrails.md` (per ARCH `/decisions` entry).
- ✅ No anti-pattern violations introduced.
- ✅ Contract's "What will NOT be built" list honoured.

## Evidence

- Source: `cli/src/**/*.ts`, `cli/tests/**/*.ts`, `cli/bin/skills-repo.mjs`, `cli/package.json`, `cli/tsconfig.json`, `cli/vitest.config.ts`.
- Implementation plan: `plans/ps1.1-implementation-plan.md`.
- Traces: `.skills-repo/traces/*.jsonl` produced during tests (ephemeral per-test tmp repos; see e2e test for live-fire trace emission).

## Carried LOW findings

- All ps1.1 Run-2 review LOWs were zero — no carried debt from this story.

## Next

ps2.1 (Fetch from configurable source) builds on this skeleton.
