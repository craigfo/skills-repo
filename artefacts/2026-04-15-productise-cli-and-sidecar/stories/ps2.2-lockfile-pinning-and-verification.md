## Story: Lockfile pinning and verification — `lock.json` pins per-file hashes; `run` verifies before execution

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-2-fetch-lockfile-hash-integrity.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **`init` to write a `lock.json` pinning engine version, source URL + ref, and per-file SHA-256 hashes of every fetched skill and standard, and `run` to verify resolved content against the lock before executing**,
So that **governance hash-verification (C5) is delivered structurally, not advisorily, and auditors can confirm which exact skill body governed any past decision** (supporting M5 and the whole C5 audit claim).

## Benefit Linkage

**Metric moved:** M5 — Cross-machine hash round-trip (prerequisite; ps2.3 is the test). Supports C5 directly.
**How:** Without `lock.json` pins, there is no trusted mapping from a trace's `skillSetHash` to a specific file body. This story writes the lockfile and adds the pre-execution verification that makes that mapping load-bearing.

## Architecture Constraints

- Hash algorithm: SHA-256 per file; algorithm name recorded in `lock.json` to allow future rotation.
- Lockfile schema: `{ engineVersion, source: { url, ref, refKind: "tag"|"commit"|"branch" }, files: [{ path, sha256 }] }`.
- Byte-exact verification — `run` must read resolved files, compute SHA-256, compare to lock, and abort on any mismatch.
- Lockfile committed to git (it lives under `.skills-repo/`, which is tracked except for `state/` and `cache/`).
- Structural enforcement preferred over instructional (C13) — verification is a hard code path, not a skill instruction.

## Dependencies

- **Upstream:** `ps2.1` DoD-complete — fetch must produce snapshots before they can be hashed.
- **Downstream:** `ps2.3` (round-trip test verifies lockfile semantics); `ps3.1` (`run next` relies on verification).

## Acceptance Criteria

**AC1:** Given `init` has fetched skills + standards successfully (per ps2.1), When `init` writes the sidecar, Then `.skills-repo/lock.json` contains: `engineVersion` (non-empty string), `source.url` and `source.ref` (matching the fetch), `source.refKind` ("tag", "commit", or "branch"), and a `files` array with one entry per resolved file containing `path` (relative to `.skills-repo/`) and `sha256` (lowercase hex).

**AC2:** Given `.skills-repo/lock.json` and resolved files exist in a consistent state, When the operator runs any `run` command, Then the CLI computes SHA-256 of each resolved file, compares to the lockfile, and proceeds only if every pair matches.

**AC3:** Given a resolved file under `.skills-repo/skills/` or `/standards/` has been modified (by any means) after `init` so its SHA-256 no longer matches the lockfile entry, When `run` is invoked, Then the CLI exits non-zero with an error naming the specific file and both hashes, and does not execute any skill.

**AC4:** Given `lock.json` declares a file that does not exist on disk, When `run` is invoked, Then the CLI exits non-zero with a clear error naming the missing file; the CLI does not attempt to re-fetch.

**AC5:** Given `source.refKind` is `"branch"` in `lock.json`, When `run` is invoked, Then the CLI emits a WARNING to stderr reminding the operator that branch refs risk upstream drift (A.9), and proceeds if hashes match.

**AC6:** Given `lock.json` file itself is missing, When `run` is invoked, Then the CLI exits non-zero with a message pointing the operator at `init` or `upgrade` and does not attempt to execute any skill.

## Out of Scope

- Cross-machine round-trip test — `ps2.3`.
- Automatic re-fetch on hash mismatch — MVP is strict-fail only; no silent recovery.
- Signature verification of lockfile (GPG / Sigstore) — OOS; future work.
- Lockfile diff tooling / `upgrade` preview — OOS per discovery.

## NFRs

- **Performance:** Verification on `run` adds under 500 ms overhead for a typical preset (~20 files).
- **Security:** Lockfile is plain text JSON; no secrets, no tokens. Readable by any user with repo read.
- **Audit:** Every successful verification writes a trace entry `{type: "verify", filesChecked, result: "pass", timestamp}` to `.skills-repo/traces/`; every failure writes `{type: "verify", result: "fail", mismatches: [...]}`.

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
