# Implementation Plan: ps2.2 — Lockfile pinning and verification

**Branch:** `feature/ps2.2-lockfile-pinning-and-verification`

## Tasks (TDD order)
1. `cli/src/engine/lock.ts` — types, `sha256Path`, `writeLockFile`, `readLockFile`, `verifyAgainstLock`.
2. Extend `init.ts` to write `lock.json` after successful fetch (sourced mode only).
3. Extend `run.ts` to verify against the lockfile before executing any skill.
4. Exit-code contract: 3 = missing lock, 4 = missing file, 5 = hash mismatch.
5. Branch-refKind WARN on verify pass.
6. 9 lock.test.ts tests (AC1–AC6 + skeleton-mode fallback + sort determinism + hash round-trip).

## Scope boundary
- No `upgrade` (out of scope per discovery).
- No auto-refetch on mismatch (strict-fail only).
- No signature verification.
