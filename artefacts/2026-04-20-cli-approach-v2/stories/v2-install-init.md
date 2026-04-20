## Story: Install scaffolded CLI into existing project 1 via `init` honouring permanent-exclusion list

**Epic reference:** `../epics/e1-install-exclusion.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator (self-consumer on two existing projects per Clarify Q3)**,
I want to **install the CLI into project 1 via `skills-repo init`**,
So that **M5 (non-fork adoption) records its first existence-proof: realistic repo structure with operator-authored content survives install with no in-place modification**.

## Benefit Linkage

**Metric moved:** M5 — Non-fork adoption across two existing projects.
**How:** Install on project 1 is the first real non-fork adoption event. It establishes 1/2 against the M5 target; project 2 closes 2/2 in Epic 3. Demonstrates the sidecar + lockfile adoption path against realistic structure (not synthetic scaffold) and exercises the permanent-exclusion list in anger.

## Architecture Constraints

- **ADR-013** — `init` must invoke the shared governance package (`governance-package.js`) for any hash operation; no local hash implementation in the CLI adapter.
- **ADR-phase4-enforcement** — CLI is the regulated / CI surface-class mechanism; `init` is the entry point.
- **ADR-004** — `.github/context.yml` is the single config source of truth; upstream URL, managed paths, and any operator-configured `skills_upstream.extra_exclusions` are read from there.
- **Spike C addendum-1d** — permanent-exclusion list is hardcoded: `pipeline-state.json`, `pipeline-state.schema.json`, `.github/context.yml`, `.github/copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `fleet/`, `fleet-state.json`, `product/**`. Not configurable via `context.yml`.
- **W4 (solo-operator posture)** — RISK-ACCEPT standard; single approver.
- **C1 non-fork** (`product/constraints.md` §1) — install must not require forking `heymishy/skills-repo`.
- **C5 hash-verified** (§5) — lockfile records hash pins for every fetched file.
- **MC-SEC-02** — no credentials in any CLI output or lockfile content.

## Dependencies

- **Upstream:** `p4-enf-cli` must have DoD-complete the `init` command (AC1 in `artefacts/2026-04-19-skills-platform-phase4/stories/p4-enf-cli.md`). This story assumes `init` has real logic, not a stub.
- **Upstream:** `p4-enf-package` (`src/enforcement/governance-package.js`) must be stable — Spike A PROCEED already delivered; ADR-013 makes it the contract.
- **Downstream:** v2-install-sidecar-lockfile (observes sidecar materialisation); v2-install-collision-detection (pre-install runs first); v2-e2e-project1 (first cycle depends on completed install).

## Acceptance Criteria

**AC1:** Given project 1 is an existing git repo with operator-authored content at exclusion-list paths (`pipeline-state.json`, `.github/context.yml`, `.github/copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `product/**`), When the operator runs `skills-repo init` in the repo root, Then the sidecar directory (managed paths per `skills_upstream.managed_paths` in context.yml) is created with fetched upstream content, and a lockfile containing SHA-256 hashes of every fetched file is committed to the sidecar.

**AC2:** Given `init` runs in project 1, When the command completes (success or failure), Then `git diff` against the pre-install commit shows zero modifications to any path in the permanent-exclusion list: no changes to `pipeline-state.json`, `.github/context.yml`, `.github/copilot-instructions.md`, `workspace/**`, `artefacts/**`, `.github/workflows/`, `fleet/`, `fleet-state.json`, or `product/**`.

**AC3:** Given `init` completes successfully, When the operator runs `git log --oneline`, Then the commit log has no automated commits from `init` — install-generates-no-commits per `p4-dist-no-commits` behaviour upstream. The operator commits the sidecar + lockfile explicitly in a separate step.

**AC4:** Given project 1 has already been initialised (lockfile exists), When the operator runs `skills-repo init` again, Then the command exits with status code >0 and reports "already initialised" without modifying sidecar content or overwriting the lockfile.

**AC5:** Given project 1 has a consumer-authored `## ADR-NNN` block in `.github/architecture-guardrails.md`, When `init` fetches and materialises upstream `architecture-guardrails.md`, Then the consumer-authored ADR block is preserved (managed-merge pattern per Spike C addendum-1d); if an unresolvable conflict exists, `init` halts and reports the conflict path.

## Out of Scope

- Installing on project 2 (Story v2-e2e-project2 covers).
- `upgrade` — separate command, Story v2-e2e-upgrade.
- Sidecar deletion or rollback — not an MVP behaviour.
- Alternative distribution (non-npm) — permanently out of MVP per Spike C.
- Install progress UX (spinner, progress bar) — not an MVP concern.

## NFRs

- **Security:** No credentials or PAT tokens in CLI output, lockfile, or stderr (MC-SEC-02). `.github/context.yml` is read but credentials cannot be read into install artefacts.
- **Audit:** Lockfile records the source ref (upstream commit SHA), the managed-paths enumeration, and per-file SHA-256 hashes — sufficient for downstream hash re-verification on `verify`.
- **Performance:** `init` on an upstream of ~50 files completes in under 30 seconds on a standard broadband connection.
- **Idempotence:** Re-running `init` on an already-initialised repo is a no-op (AC4), never a partial write.

## Complexity Rating

**Rating:** 2
**Scope stability:** Unstable — project 1's specific structure will surface exclusion-list quirks not anticipated by this AC set.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on `p4-enf-cli` AC1 DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (Medium)
