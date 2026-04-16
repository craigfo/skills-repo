# Review Report: ps1.1 End-to-end CLI skeleton — Run 1

**Story reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/stories/ps1.1-end-to-end-cli-skeleton.md`
**Date:** 2026-04-15
**Categories run:** A, B, C, D, E
**Outcome:** PASS

---

## HIGH findings — must resolve before /test-plan

None.

## MEDIUM findings — resolve or acknowledge in /decisions

- **1-M1** (C — AC quality) — AC5 is phrased as a meta-assertion about test infrastructure rather than an observable behaviour Given/When/Then. Quote: *"verified by a wrapper acceptance test that snapshots the host repo before and after each command and diffs excluded paths."* This describes *how it's tested*, not *what must be true*. The same assertion belongs in `/test-plan`, not in an AC.
  Risk if proceeding: a test-plan that implements this wrapper harness satisfies the AC; if the wrapper is later removed the AC "passes" without the underlying invariant being held.
  Fix: rewrite AC5 as: *"Given any CLI command has completed, When `git status --porcelain` is run, Then output contains no modifications to files outside `.skills-repo/` or `artefacts/` (and, if the operator confirmed the prompt, only the two approved `.gitignore` lines)."*

- **1-M2** (E — Architecture compliance) — The Architecture Constraints field **proposes** a new guardrail (*"CLI commands never write outside `.skills-repo/` or `artefacts/`…"*) but this guardrail does not yet exist in `.github/architecture-guardrails.md`. Proposing a guardrail in a story is not the same as having it. H9 at DoR will check against guardrails-that-exist; this proposed one won't count.
  Risk: DoR may pass without the guardrail being landed; later stories may drift without the structural check.
  Fix: add the guardrail to `.github/architecture-guardrails.md` (new entry in Guardrails Registry) as a separate repo-level PR before this story enters DoR, OR acknowledge via `/decisions` with a scope note that the guardrail lands alongside ps1.1 implementation.

## LOW findings — note for retrospective

None.

---

## Scores

| Criterion | Score | Pass/Fail |
|-----------|-------|-----------|
| Traceability | 5 | PASS |
| Scope integrity | 5 | PASS |
| AC quality | 4 | PASS |
| Completeness | 5 | PASS |

## Summary

0 HIGH, 2 MEDIUM, 0 LOW.
**Outcome:** PASS — 2 MEDIUM findings to resolve or acknowledge in `/decisions` before `/test-plan`.
