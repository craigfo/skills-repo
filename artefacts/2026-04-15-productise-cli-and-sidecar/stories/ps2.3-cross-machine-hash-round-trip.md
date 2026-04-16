## Story: Cross-machine hash round-trip acceptance test — reproducibility proven on ≥2 environments

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-2-fetch-lockfile-hash-integrity.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **have an automated acceptance test that runs `init` against a fixed `lock.json` on a clean second environment and verifies every per-file hash matches byte-for-byte**,
So that **M5 (cross-machine hash round-trip) is not a claim but a structural check, and A.3 is promoted from assumption to validated fact before MVP ships** (failure blocks ship; per Q4 decision).

## Benefit Linkage

**Metric moved:** M5 — Cross-machine hash round-trip. MM3 — Fetch-and-pin model held (this is the primary validation).
**How:** This story *is* the measurement mechanism for M5 and the structural test for MM3. Without it, both metrics remain aspirational.

## Architecture Constraints

- The second environment must be genuinely independent of the primary — acceptable implementations: a Docker container with a clean filesystem, a separate VM, a second physical machine, or a GitHub Actions runner (ironic but acceptable; the test itself does not require CI to be wired into assurance-gate).
- The test is invoked by `npm test` (or equivalent in the CLI package's test runner) — not a manual-only procedure.
- Any mismatch must exit non-zero with a diff naming the mismatched files and both hashes.
- P4.5 (platform parity) — test must run on both macOS and Linux environments; Windows parity acceptable post-MVP if not trivially covered.
- None identified in `.github/architecture-guardrails.md`; the CLI-package scope is new per ps1.1 comment.

## Dependencies

- **Upstream:** `ps2.1` (fetch), `ps2.2` (lockfile) — both DoD-complete.
- **Downstream:** `ps3.3` (dogfood run uses the same acceptance test as proof of MM3).

## Acceptance Criteria

**AC1:** Given a `lock.json` produced by a prior `init` on environment E1, When the test runs `init` using that same `lock.json` (or equivalent source+ref) on environment E2 (a clean Docker container or equivalent), Then every `files[].sha256` in the newly resolved `.skills-repo/` matches the corresponding lockfile entry byte-for-byte.

**AC2:** Given any file's hash differs between E1's lockfile and E2's resolved content, Then the test exits non-zero, prints the file path, both hashes, and a diff of the first and last 40 bytes of each version.

**AC3:** Given the test script is run with no arguments, Then it: (i) performs `init` on the primary environment, capturing the lockfile; (ii) spawns a clean Docker container (or equivalent isolated environment) with the same source ref; (iii) performs `init` inside the container; (iv) diffs hashes; (v) returns a single pass/fail summary. [Testability: accepted by operator on 2026-04-15 — procedural form retained because test harness shape is inherent to the acceptance; see review/ps2.3-…-review-1.md 1-M1.]

**AC4:** Given the test is added to the CLI package's `npm test` script, When `npm test` runs in CI or locally, Then the round-trip test is part of the output and any mismatch fails the overall test run.

**AC5:** Given the test has passed, Then the DoD artefact for this story records the primary and secondary environment details (OS, node version, container image if applicable) and the lockfile refs used, as evidence. On re-run the evidence file can be regenerated deterministically.

## Out of Scope

- Windows environment parity — post-MVP if not trivially covered by the test harness.
- Signature verification (GPG / Sigstore) on lockfile — future.
- Round-trip against multiple independent sources — one source (default `craigfo/skills-repo`) at MVP.
- Performance benchmarking — pass/fail only; no timing assertions beyond NFR below.

## NFRs

- **Performance:** The round-trip test completes in under 5 minutes on a typical laptop + local Docker.
- **Reliability:** Test is deterministic — given the same source ref and lockfile, a pass is a pass across 100 consecutive invocations.
- **Audit:** Test output is written to `.skills-repo/traces/` on the primary environment as evidence artefact for M5 and MM3.

## Complexity Rating

**Rating:** 3
**Scope stability:** Stable

<!-- Complexity 3 rationale: cross-environment orchestration (Docker/VM/CI),
     byte-exact hash claims across filesystems with potentially different
     default behaviours (EOL, attributes, encoding), and failure-mode surface
     that is harder to test until it's run in anger. -->

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
