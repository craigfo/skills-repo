# Implementation Plan: ps3.3 — Dogfood acceptance run

**Branch:** `feature/ps3.3-dogfood-acceptance-run`

## Tasks
1. Move `tsx` from devDeps → deps so the bin shim resolves after a global install.
2. `cli/scripts/dogfood-run.sh` — packs CLI tarball, installs into a scratch npm prefix, creates a fresh git repo + local fixture source, runs init → artefact new → run next (×N) → mark-step-done implement → run next, asserts M1, emits JSON evidence with timestamps.
3. `workspace/productisation-incidents.md` — MM2 tracking file shell.
4. Gitignore `workspace/dogfood-evidence/`.

## Scope notes
- AC4 24h/7d resume: deferred per decisions.md (MVP scope M3 window).
- AC6 round-trip on dogfood lockfile: satisfied by same code paths in ps2.3 harness.
- No automated UX protocol — operator-driven dogfood is the evidence.

## DoD
- Dogfood script exits 0
- `git status` clean in dogfood target
- Evidence JSON emitted with sub-30-min M2 figure
- Full `npm test` still green (50/50 vitest + round-trip)
