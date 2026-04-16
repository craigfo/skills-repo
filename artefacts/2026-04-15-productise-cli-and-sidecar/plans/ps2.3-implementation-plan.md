# Implementation Plan: ps2.3 — Cross-machine hash round-trip

**Branch:** `feature/ps2.3-cross-machine-hash-round-trip`

## Decision
Docker-matrix deferred to post-MVP. Secondary environment is a fresh Node
subprocess in an independent tmp dir. See decisions.md (2026-04-15 SCOPE
ps2.3 Docker → subprocess fallback).

## Tasks
1. `cli/scripts/round-trip.mjs` — harness: primary init → capture lockfile → spawn subprocess in fresh tmp dir → secondary init against the same source/ref → compare hashes → emit JSON evidence.
2. Self-fixture fallback so `npm run test:round-trip` with no args works offline.
3. `package.json scripts.test` chains vitest then the round-trip script (AC4).
4. `cli/tests/round-trip.test.ts` — 5 tests covering AC1–AC5.

## DoD
- 34/34 Vitest + round-trip harness green.
- Evidence file written with platform/node details (AC5).
