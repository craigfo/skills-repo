## Story: Sidecar materialisation + lockfile commit with hash pins observable

**Epic reference:** `../epics/e1-install-exclusion.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want to **observe the sidecar structure and lockfile content after `init` completes on project 1**,
So that **the non-fork adoption path is verifiable by inspection — the sidecar holds upstream content hash-pinned via lockfile, and the lockfile is the observable contract between project 1 and `heymishy/skills-repo`**.

## Benefit Linkage

**Metric moved:** M5 — Non-fork adoption (lockfile observability is the mechanism by which non-fork can be *verified*, not just *claimed*). Also M3 — trace anchoring at install-boundary.
**How:** The lockfile's SHA-256 pins make the non-fork claim independently auditable: any reader of project 1's commit history can verify exactly what upstream content was installed and at what hash. Without the lockfile, M5's verification depends on trust rather than artefact.

## Architecture Constraints

- **ADR-013** — lockfile hash entries produced via `governance-package.js` hash operations, not CLI-local.
- **ADR-004** — `skills_upstream.url`, `skills_upstream.ref`, `skills_upstream.managed_paths`, and `skills_upstream.extra_exclusions` sourced from `.github/context.yml`.
- **C5 hash-verified** — every managed file in the sidecar has a corresponding SHA-256 entry in the lockfile.
- **Spike C addendum-1d** — lockfile's managed-paths enumeration respects permanent-exclusion list (no exclusion-list path appears as a managed path).
- **Repo ADR-003 schema-first** — lockfile schema documented; any new field requires schema update in same commit.

## Dependencies

- **Upstream:** v2-install-init (installation event itself).
- **Upstream:** `p4-enf-cli` lockfile-related helpers within the shared package (if any); otherwise lockfile shape is owned by this story.
- **Downstream:** v2-e2e-upgrade (upgrade re-reads lockfile to compute diff); v2-install-collision-detection (pre-install reads lockfile to detect already-initialised state).

## Acceptance Criteria

**AC1:** Given `init` completes on project 1, When the operator inspects the sidecar directory, Then it contains: `.skills-repo/` (or equivalent managed-paths root), the fetched SKILL.md files, POLICY.md files, templates, standards, and scripts per `skills_upstream.managed_paths` in context.yml; plus a `lockfile.json` (or equivalent) at the sidecar root.

**AC2:** Given the lockfile is committed to project 1, When it is read, Then it conforms to a documented schema containing: `upstream_url`, `upstream_ref` (commit SHA), `managed_paths` (array), `files` (object mapping relative path to `{ sha256, size }`), `installed_at` (ISO timestamp), and `cli_version`.

**AC3:** Given the lockfile is present, When `skills-repo verify` is run against it, Then every file listed in `files` has its on-disk SHA-256 re-computed and compared; a mismatch returns a non-zero exit code with the path and expected/actual hashes named.

**AC4:** Given the operator reviews `git log --follow .skills-repo/lockfile.json`, When they inspect any past lockfile version, Then the lockfile alone is sufficient to reconstruct what upstream content was installed at that point — no external tooling required.

## Out of Scope

- Lockfile signing or cryptographic trust beyond SHA-256 hashes — future hardening, not MVP.
- Lockfile migration across schema versions — not an MVP concern (single schema version for now).
- Lockfile diffing UX — covered in upgrade story when it surfaces.

## NFRs

- **Audit:** Lockfile is the canonical non-fork evidence artefact; must remain human-readable (JSON, not binary) and diff-friendly (stable key ordering).
- **Security:** Lockfile does not contain credentials, PAT tokens, or session data (MC-SEC-02).
- **Correctness:** Every `files` entry's SHA-256 matches the on-disk file at install time — no drift between computation and record.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable — lockfile shape is well-understood; schema is documented; hash algorithm is fixed (SHA-256).

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (Medium)
