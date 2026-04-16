## Story: Fetch skills and standards from a configurable source at `init`

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-2-fetch-lockfile-hash-integrity.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **have `init` fetch skills and standards from a configurable git source URL + ref and write byte-identical snapshots to the sidecar**,
So that **the CLI package does not bundle the skill library, consumers can point at a fork without editing the package, and the update channel (C1) is delivered structurally** (satisfying ADR-001; supporting M4 and MM3).

## Benefit Linkage

**Metric moved:** M4 — Auditor self-service on resolved snapshots. MM3 — Fetch-and-pin model held.
**How:** Writing byte-identical snapshots to `.skills-repo/skills/` and `/standards/` is exactly what the auditor reads to answer the MODEL-RISK questions. Doing it via fetch rather than package bundle is what validates MM3.

## Architecture Constraints

- Default source: the productisation working fork (`craigfo/skills-repo` at a tagged release), per P4.4 in discovery.
- Tagged refs only for MVP (A.9) — branch refs accepted at the CLI level but flagged with a warning.
- Byte-preservation: no EOL normalisation, no BOM stripping, no text transformation on fetched files.
- Network permitted (P4.8); all other commands remain offline.
- None identified in `.github/architecture-guardrails.md` directly; the C1 constraint (update channel must never be severed) is the driving product constraint.

## Dependencies

- **Upstream:** `ps1.1` DoD-complete — this story replaces the skeleton's built-in skill with fetched content.
- **Downstream:** `ps2.2` (lockfile pinning), `ps2.3` (round-trip test), `ps3.1` (workflow resolution).

## Acceptance Criteria

**AC1:** Given `profile.yaml` contains `source: { url: <git-https-url>, ref: <tag-or-commit> }`, When the operator runs `skills-repo init`, Then the CLI fetches the skill and standard files specified by the selected preset from that source and ref, and writes them to `.skills-repo/skills/` and `.skills-repo/standards/` preserving the source directory structure.

**AC2:** Given AC1 has completed successfully, Then each fetched file's byte content equals the source file's byte content (verified by SHA-256 comparison against the source's raw content at that ref); no encoding transformation (EOL, BOM, whitespace) has occurred.

**AC3:** Given the configured `source.ref` is a branch ref rather than a tag or commit SHA, When `init` runs, Then the CLI writes a WARNING to stderr naming the ref and recommending a tag or SHA for reproducibility, and proceeds.

**AC4:** Given the source URL is unreachable (network error, 404, DNS failure), When `init` runs, Then the CLI exits non-zero with a clear error naming the source URL and the specific failure mode, and leaves `.skills-repo/` in a recoverable state (no half-written files; transaction is atomic — either all files or none).

**AC5:** Given the operator passes `--source=<url> --ref=<tag>` on the command line, When `init` runs, Then those values override any source/ref in `profile.yaml` templates, and the resolved values are written into the new `profile.yaml`.

## Out of Scope

- Hash pinning / lockfile writing — `ps2.2`.
- Cross-machine round-trip validation — `ps2.3`.
- `upgrade` flow that re-fetches with a different ref — OOS per discovery.
- Custom override files (`.skills-repo/skills/custom/`) — OOS per discovery.
- Non-git transports (tarball, CDN, npm scope) — OOS.

## NFRs

- **Performance:** Fetch of the `story-unit-min` preset (≤20 files) completes in under 30 seconds on a typical broadband connection.
- **Security:** No credentials embedded in source URLs; if private source is configured, the CLI consults `git`'s configured auth (ssh key / credential helper) — no auth is stored by the CLI.
- **Audit:** Successful fetch writes a trace entry `{type: "fetch", source, ref, files, timestamp}` to `.skills-repo/traces/`.
- **Reliability:** Fetch is transactional — partial failures do not leave the sidecar in a half-resolved state.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
