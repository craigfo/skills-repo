## Story: Second full feature cycle on project 2 — cross-project quirks surface

**Epic reference:** `../epics/e3-e2e-validation.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator self-consuming on a second existing project**,
I want to **install the CLI on project 2 and run a full feature cycle end-to-end**,
So that **M5 reaches its 2/2 target, cross-project quirks (structural differences between projects 1 and 2) surface before the feature is declared MVP-complete, and MM1 records its second cycle**.

## Benefit Linkage

**Metric moved:** M5 (2/2 projects non-fork-adopted), MM1 (cycle 2), A4 continues.
**How:** Single-project validation can mistake setup-artefact for normal behaviour. Project 2 is the cross-project check: any blocker that appears on project 2 but not project 1 is a real cross-project fragility, not a project-1 idiosyncrasy. This is the discriminating signal Q3 (DESIGN decision) was designed to produce.

## Architecture Constraints

- Same as v2-e2e-project1.
- Additionally: operator-configured `skills_upstream.extra_exclusions` may differ between projects (each operator-authored `context.yml` is distinct); the check that `init` and `advance` both honour per-project configuration is exercised here.

## Dependencies

- **Upstream:** v2-e2e-project1 (cycle 1 must complete before cycle 2 starts — learnings from cycle 1 feed cycle 2 setup).
- **Upstream:** Epic 1 stories applied to project 2 (second install; same mechanics).
- **Upstream:** Epic 2 workflow declaration reused across both projects.
- **Downstream:** v2-e2e-upgrade, v2-docs-integration-guide.

## Acceptance Criteria

**AC1:** Given project 2 is an existing repo distinct from project 1 (different structure, different `.gitignore`, different pre-existing content), When the operator installs the CLI on project 2 via the full Epic 1 flow, Then install succeeds with zero exclusion-list violations and the lockfile records project-2-specific pins.

**AC2:** Given project 2 is installed, When the operator runs a full feature cycle end-to-end via the CLI (same flow as v2-e2e-project1), Then cycle 2 reaches /definition-of-done without mid-cycle abandonment.

**AC3:** Given both cycle 1 and cycle 2 complete, When the operator compares per-cycle journals, Then cross-project blockers (blockers on project 2 not seen on project 1) are explicitly identified and classified: (a) structural cross-project issue — raise as a v2 follow-up; (b) project-2-specific unrelated issue — log, ignore.

**AC4:** Given cycle 2 emits traces, When the aggregate traces from both cycles are rolled up, Then M1 / M2 / M3 / M4 live signals are computed across both cycles combined; the per-cycle breakdown is recorded so cycle-1-specific drift can be distinguished from aggregate trends.

**AC5:** Given project 2 has a different `skills_upstream` configuration (e.g. `extra_exclusions` specific to project 2), When `init` runs, Then project-2's configuration is respected without cross-contamination from project 1's context.yml. No global state leaks between project installs.

## Out of Scope

- Second-party consumer — out of MVP per Q3.
- More than two projects — MVP target is exactly 2.
- Upgrade on project 2 — v2-e2e-upgrade covers at least one project; choice of project deferred to that story.

## NFRs

- Same as v2-e2e-project1.

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — project 2's structure will surface unexpected differences from project 1.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on v2-e2e-project1 DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
