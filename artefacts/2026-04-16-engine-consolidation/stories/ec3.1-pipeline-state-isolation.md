## Story: Relocate pipeline-state from `.github/` root to per-artefact; root becomes derived

**Epic reference:** `artefacts/2026-04-16-engine-consolidation/epics/epic-3-pipeline-state-isolation.md`
**Decision reference:** `decisions.md` — Q5 (ARCH scope-add, 2026-04-16)
**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`

## User Story

As the **productisation-thread contributor running a pipeline run concurrently with another contributor's Phase 3 work**,
I want to **write pipeline state to a file scoped to my own feature's artefact folder, not to a shared root file**,
So that **concurrent phase-boundary writes from different features never race on the same file, my run's history survives completion, and the cross-feature view is still available via a derived aggregate**.

## Benefit Linkage

**Metric moved:** MM4 pipeline-state write contention (registered in `benefit-metric.md` 2026-04-16 amendment; parts (a) structural-at-DoD and (b) operational-30-days-post-ship).
**How:** Eliminates the one shared root JSON write target; replaces it with per-feature files plus a read-only aggregate. Adds `featureStatus: complete` marker so retained history carries a lifecycle flag.

## Architecture Constraints

- Must not break `pipeline-viz.html` rendering — viz keeps reading a single JSON input; the scanner's output feeds it.
- Must not change `pipeline-state.schema.json` beyond adding the `featureStatus` enum field.
- Must preserve existing state for features in-flight at cut-over (ec1.x migrations, ec2.x governance docs) — scanner folds them into the aggregate seamlessly.

## Dependencies

- **Upstream:** None structural. Runs in parallel to ec1.x / ec2.x in principle.
- **Downstream:**
  - ec2.1 CONTRIBUTING.md subsection 7 (pipeline-state coordination) — must not merge before ec3.1 is shipped or the doc describes non-existent behaviour.
  - All future features' pipeline runs — they depend on skills writing to the new per-artefact path.

## Acceptance Criteria

**AC1:** Given the feature branch, When every `.github/skills/*/SKILL.md` (and any helper invoked by a skill) is inspected for state-write instructions, Then every write targets `artefacts/<current-feature-slug>/pipeline-state.json`, not `.github/pipeline-state.json`.
  Verification: `grep -rn '\.github/pipeline-state\.json' .github/skills/ scripts/ cli/` returns **zero** matches against write paths; any remaining matches are in read-only scanner / archival-reference paths and explicitly commented.

**AC2:** Given the feature branch, When `scripts/build-pipeline-state.js` (or equivalent — final name agreed in implementation) is run at the repo root, Then it produces a single JSON document at `.github/pipeline-state.derived.json` whose `features[]` array is the union of every `artefacts/*/pipeline-state.json`, ordered by `updatedAt` descending.
  Verification: run the scanner on a repo that already has ≥2 artefact folders with state files; diff the output against the pre-existing root `.github/pipeline-state.json` — the `features[]` contents are equivalent (field-for-field on features present in both).

**AC3:** Given AC2's scanner output, When `pipeline-viz.html` is loaded, Then it renders from `.github/pipeline-state.derived.json` (or equivalent path) without code changes beyond the input-file path constant.
  Verification: file open / fetch path change is a one-line edit; viz renders identically for a test artefact-folder set.

**AC4:** Given a feature that has reached DoD sign-off, When the DoD skill (or equivalent end-of-feature skill) writes its final state, Then the artefact's `pipeline-state.json` includes the top-level field `"featureStatus": "complete"` and the file is **retained** — not deleted, not moved.
  Verification: JSON schema check for `featureStatus ∈ {"in-flight", "complete"}`; `git ls-files artefacts/<slug>/pipeline-state.json` returns the path post-completion.

**AC5:** Given the feature branch, When `.github/pipeline-state.json` is inspected, Then it is **either** deleted from `HEAD` (git history retained via the relocation commit) **or** replaced with a pointer document (≤10 lines) that states the per-artefact convention and names the derived aggregate path. Exactly one of these two outcomes — not both.
  Verification: `git ls-files .github/pipeline-state.json` — if present, `file --mime-type` is `text/plain` and content matches the pointer template; if absent, `git log -- .github/pipeline-state.json` shows the relocation commit with explanatory message.

**AC6:** Given the scanner exists and at least one feature is in-flight with a per-artefact state file, When any skill that was previously writing root state runs and completes a phase, Then the state write is observable in `artefacts/<current-feature-slug>/pipeline-state.json` (updatedAt refreshed, phase-specific field populated) and is **not** observable in any file at `.github/pipeline-state.json` (unless that file is the pointer document from AC5).
  Verification: before/after `git diff` on the relevant files across a single skill invocation.

**AC7:** Given `pipeline-state.schema.json`, When the schema is inspected, Then the only delta vs pre-migration is the addition of `featureStatus` as a top-level enum field on a feature record. No existing fields are removed, renamed, or retyped.
  Verification: `jq` diff of schema files before/after; diff shows exactly one additive change.

## Out of Scope

- **Write-locking or advisory file-lock mechanisms.** Per-artefact sharding removes the contention structurally.
- **Migration of historical completed features into per-artefact files.** The existing root file is retained as a read-only archival reference (by AC5 pointer variant) for features that predate the split; completed-feature state is not backfilled.
- **Changes to `pipeline-viz.html` rendering logic.** Input path only (AC3).
- **New metrics beyond MM4 reconciliation.** MM4 itself is noted as a follow-up on the benefit-metric sheet; this story does not amend benefit-metric.md.
- **Slug-detection logic for "current feature slug."** Assume each skill already knows or can derive the active feature slug from the branch / working directory context; if it doesn't, that's a pre-existing gap, separate.

## NFRs

- **Scanner runtime:** aggregate rebuild over the current artefacts/ tree (≤10 features) must complete in under 1 second on a dev laptop. If this floor fails, revisit via Q5 revisit trigger.
- **Backward readability:** any reader that loaded `.github/pipeline-state.json` continues to work against `.github/pipeline-state.derived.json` without schema changes (path-only change).

## Complexity Rating

**Rating:** 3
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
