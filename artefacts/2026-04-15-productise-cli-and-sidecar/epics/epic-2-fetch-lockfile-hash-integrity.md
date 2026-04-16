## Epic: Fetch, lockfile, and hash integrity — skills come from a configurable source and reproduce byte-for-byte across machines

**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`
**Slicing strategy:** Walking skeleton

## Goal

The CLI's trivial built-in skill (Epic 1) is replaced with a real fetch from a configurable source URL at `init` time, producing byte-identical snapshots in `.skills-repo/skills/` and `.skills-repo/standards/`. `.skills-repo/lock.json` pins `{engine-version, source-url, source-ref, per-file-hash}`; `run` verifies resolved content against the lock before executing. A cross-machine acceptance test proves the round-trip: same lockfile on a clean second environment reproduces every hash byte-for-byte. This closes ADR-001 and validates A.3.

## Out of Scope

- `upgrade` command — version bumping + preview diff is OOS per discovery.
- Custom-skill overrides (`.skills-repo/skills/` as authorial source) — OOS per discovery.
- Multiple simultaneous sources — single `source-url` per `profile.yaml` at MVP.
- Tarball / CDN / npm-scope sources — git-hosted source URL only; other transports defer.
- `workflow.yaml` schema definition — Epic 3.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| M4 — Auditor self-service on resolved snapshots | In-tree layout passes today; must not regress | Pass (binary) | Snapshots written to `.skills-repo/skills/` and `/standards/` preserve auditor-readable content. |
| M5 — Cross-machine hash round-trip | N/A (new) | 100% match across ≥2 environments | ps2.3 is the acceptance test itself. |
| MM3 — Fetch-and-pin model held | 0 expected | 0 fetch-related failures | Exercise of the fetch + pin path is the primary evidence for A.9. |

## Stories in This Epic

- [ ] `ps2.1` — Fetch skills and standards from a configurable source at `init` — `stories/ps2.1-fetch-from-configurable-source.md`
- [ ] `ps2.2` — Lockfile pinning and verification — `stories/ps2.2-lockfile-pinning-and-verification.md`
- [ ] `ps2.3` — Cross-machine hash round-trip acceptance test — `stories/ps2.3-cross-machine-hash-round-trip.md`

## Human Oversight Level

**Oversight:** Medium
**Rationale:** Same as Epic 1. Cross-machine test (ps2.3) is complexity 3; operator reviews acceptance-test shape before agent proceeds.

## Complexity Rating

**Rating:** 2

## Scope Stability

**Stability:** Stable
