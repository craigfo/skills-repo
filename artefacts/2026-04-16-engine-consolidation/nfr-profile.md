# NFR Profile: Engine consolidation (CLI as control plane)

**Feature:** 2026-04-16-engine-consolidation
**Created:** 2026-04-16
**Last updated:** 2026-04-16
**Status:** Active

---

## Performance

| NFR | Target | Measurement method | Applies to story |
|-----|--------|--------------------|-----------------|
| Test execution time per subcomponent | Post-migration test run completes within ±10% of pre-migration wall-clock time | Time pre- and post-migration test runs; record in story DoD | ec1.1–ec1.7 |

A significant slowdown (>10%) is a signal of implicit coupling or path-resolution drift — investigate as a test failure.

---

## Security

| NFR | Requirement | Applies to story |
|-----|-------------|-----------------|
| No new credential handling | None introduced by move-only migration | ec1.1–ec1.7 |
| No new external calls | Network / IO surface unchanged | ec1.1–ec1.7 |
| No writes outside `cli/` at runtime | MC-CLI-01 guardrail (build-time layout only in this feature) | ec1.1–ec1.7 |

**Source:** existing C12, C15 in `product/constraints.md`; new guardrail MC-CLI-01.

---

## Data classification and residency

| NFR | Value | Applies to |
|-----|-------|-----------|
| Data classification | Public — all content being moved is non-sensitive platform code + tests | Feature-wide |
| Data residency | No change — local-filesystem and git only | Feature-wide |

---

## Audit and traceability

| NFR | Requirement | Applies to story |
|-----|-------------|-----------------|
| Git history preserved | Use `git mv` (or equivalent) so `git log --follow` continues to resolve history on moved files | ec1.1–ec1.7 |
| Pre/post test snapshot recorded | M2 invariant; each story's DoD includes pre-/post-migration test counts + pass rates | ec1.1–ec1.7 |
| `/decisions` logs any RISK-ACCEPT | If M2 invariant is broken and deliberately accepted (rare), the deviation lands in `decisions.md` with rationale | ec1.1–ec1.7 |

---

## Availability

Not applicable — repository refactor, not a runtime service.

---

## Accessibility

Not applicable — non-UI code.

---

## Compliance frameworks

**None identified.** Internal platform change; no named regulatory framework triggered.

Product-level constraints honoured:
- **C3** (spec immutability) — no spec artefacts modified.
- **C4** (human approval gate for SKILL.md/POLICY.md changes) — no instruction-set content changed.
- **C5** (hash-verified instruction sets) — hash chain unaffected (move-only; byte contents of files unchanged after `git mv`).
- **C13** (structural governance preferred) — this feature IS that principle being enforced.

---

## Reliability

| NFR | Requirement | Applies to story |
|-----|-------------|-----------------|
| Move-only semantics | No behaviour change per migrated subcomponent; public interfaces preserved | ec1.1–ec1.7 |
| Transactional per PR | If a subcomponent's migration fails pre/post test parity, its PR is not merged; the subcomponent stays in `src/` until the deviation is resolved | ec1.1–ec1.7 |

---

## Scope stability

All stories rated **Stable** at definition.

---

## Sign-off requirements

No named regulatory clauses requiring human sign-off before DoR. Standard oversight:
- Epic 1 migrations: **Medium** — operator reviews each subcomponent PR.
- Epic 2 docs: **Low** — documentation only.
