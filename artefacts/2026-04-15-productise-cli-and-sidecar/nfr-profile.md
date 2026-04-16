# NFR Profile: Productise skills-repo — CLI + Sidecar

**Feature:** 2026-04-15-productise-cli-and-sidecar
**Created:** 2026-04-15
**Last updated:** 2026-04-15
**Status:** Active

---

## Performance

| NFR | Target | Measurement method | Applies to story |
|-----|--------|--------------------|-----------------|
| `init` completion (skeleton, no fetch) | < 10 s on a clean repo | Wall-clock in acceptance test | ps1.1 |
| `init` with fetch (story-unit-min preset) | < 30 s on typical broadband | Wall-clock in acceptance test | ps2.1 |
| `run` hash verification overhead | < 500 ms for ~20 files | Time delta pre/post verify | ps2.2 |
| `run next` step resolution | < 2 s to begin skill interaction | Wall-clock | ps3.1 |
| `status` command | < 1 s on sidecar with ≤20 skills, ≤10 artefacts | Wall-clock | ps3.2 |
| Cross-machine round-trip test | < 5 min end-to-end on laptop + local Docker | Wall-clock in test harness | ps2.3 |
| End-to-end time-to-first-artefact (M2) | Target < 15 min; minimum signal < 30 min | Dogfood run wall-clock | ps3.3 |

**Source:** Story ACs + M2 benefit metric.

---

## Security

| NFR | Requirement | Standard or clause | Applies to story |
|-----|-------------|-------------------|-----------------|
| Credential handling | No credentials, tokens, or env vars read or logged by any CLI command | Product constraint C12 | ps1.1 (all stories) |
| Private-source auth | If source URL requires auth, defer to `git` credential helper / SSH agent — CLI does not store auth | Product constraint C12 | ps2.1 |
| Lockfile | Plain text; no secrets; readable by any repo-reader | Audit transparency | ps2.2 |
| No code execution from fetched content at fetch time | Fetched SKILL.md files are content, not code; not evaluated at fetch or verify | Product constraint C15 | ps2.1, ps2.2 |
| Hash algorithm | SHA-256 per file, algorithm name recorded in lockfile to allow future rotation | C5 hash verification | ps2.2 |

**Source:** `product/constraints.md` C5, C12, C15; story ACs.

---

## Data classification and residency

| NFR | Value | Applies to |
|-----|-------|-----------|
| Data classification | Public — all sidecar content (skills, standards, lockfile, traces) is non-sensitive platform metadata | Feature-wide |
| Data residency | No requirement — local-file-only; no telemetry, no cloud storage | Feature-wide |

---

## Audit and traceability

| NFR | Requirement | Applies to story |
|-----|-------------|-----------------|
| Trace emission | Each CLI command writes a trace entry to `.skills-repo/traces/` with `{type, timestamp, status}` at minimum | ps1.1 (all stories inherit) |
| Hash verification trace | Every `run` verification writes `{type: "verify", filesChecked, result, mismatches?}` | ps2.2 |
| Fetch trace | Successful fetch writes `{type: "fetch", source, ref, files, timestamp}` | ps2.1 |
| Step execution trace | Each step execution writes `{step, skill, skillHash, status, startedAt, completedAt}` | ps3.1 |
| Dogfood evidence | All `.skills-repo/traces/` on the dogfood repo preserved and included in ps3.3 DoD artefact | ps3.3 |

---

## Availability

No external service dependency; local-file-only operation. No SLA.

`init` and `upgrade` may fail if the source URL is unreachable; all other commands are fully offline (per P4.8 / 004 §10).

---

## Accessibility

N/A — CLI-only surface at MVP. Future GUI or web surfaces are post-MVP (and out of scope in roadmap).

---

## Compliance frameworks

**None identified.** This is an internal-delivery platform tool for a solo operator; no named regulatory framework (PCI-DSS, GDPR, SOC 2, RBNZ) is triggered by MVP scope.

Product-level constraints `C2` (POLICY.md floors non-negotiable), `C3` (spec immutability), `C4` (human approval gate for instruction-set changes), `C5` (versioned, hash-verified instruction sets), and `C13` (structural governance preferred) apply as internal platform constraints — see story Architecture Constraints sections and benefit-metric Tier-2 meta hypothesis framing.

---

## Reliability

| NFR | Requirement | Applies to story |
|-----|-------------|-----------------|
| Atomic writes | `init` fetch + snapshot + lockfile-write is transactional (all or nothing; no half-written state on failure) | ps2.1 |
| Atomic state writes | Phase-boundary state writes use temp-file + rename to survive interruption | ps3.1 |
| Read-side invariants | `status`, `run` never mutate `.skills-repo/skills/` or `/standards/` | ps3.2 |
| Round-trip determinism | ps2.3 test produces identical pass/fail across 100 consecutive invocations at a fixed source ref | ps2.3 |

---

## Scope stability

All stories rated **Stable** at definition. Ratings revisited at `/review` and DoR.

---

## Sign-off requirements

No named regulatory clauses requiring human sign-off before DoR. Standard oversight: Medium (coding agent proceeds with operator review at each PR), per all three epics.
