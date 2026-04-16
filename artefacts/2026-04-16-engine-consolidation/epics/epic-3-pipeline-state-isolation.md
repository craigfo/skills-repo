## Epic: Pipeline state is per-artefact; root is derived

**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`
**Decision reference:** `decisions.md` — Q5 (ARCH scope-add, 2026-04-16)
**Slicing strategy:** Single structural change — one story; the migration is cohesive (file relocation + scanner + skill updates all move together).

## Goal

After this epic, no skill writes to `.github/pipeline-state.json`. Every skill that previously wrote root pipeline state now writes `artefacts/<current-feature-slug>/pipeline-state.json` scoped to the feature it is operating on. The root file is either removed (git history retained) or replaced with a pointer document explaining that pipeline-state is per-artefact and that the cross-feature view is derived.

On feature DoD sign-off, the artefact's pipeline-state file is marked `featureStatus: complete` and retained with the folder — deletion is explicitly out of scope. Audit history is preserved per-feature; the cross-feature aggregate view is rebuilt by a new scanner script walking `artefacts/*/pipeline-state.json`.

This epic removes write contention on a single root JSON file between N contributors running concurrent features, which is the operational problem that prompted the scope-add in Q5.

## Out of Scope

- **Write-locking or file-lock mechanisms.** Per-artefact sharding eliminates write contention structurally; file-locks are not needed and not introduced.
- **Schema changes to `pipeline-state.schema.json`.** The JSON shape stays the same; only the file location and sharding change. A new top-level field `featureStatus` is added (values: `in-flight`, `complete`) but that is the only schema delta and is covered by the story's AC.
- **Historical migration of completed features into per-artefact files.** Completed features retain whatever state they have today; the scanner treats the existing root file as a fallback for features that predate the split.
- **Changes to `pipeline-viz.html` beyond pointing at the scanner's aggregate output.** The viz's rendering logic is untouched.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| MM4 pipeline-state write contention | (a) ≥1 root-file write reference in skills; (b) 2 contributors racing today | (a) 0 non-read-only root references at DoD; (b) 0 conflicts over 30-day post-ship window | Story ec3.1 relocates the write target + adds scanner + adds `featureStatus: complete` marker. |
| MM1 control-plane principle realised (indirect) | existing | maintained | Per-artefact state reinforces the artefact-folder-as-unit-of-work pattern. |

MM4 is now formally registered in `benefit-metric.md` (2026-04-16 amendment per decisions Q5).

## Stories in This Epic

- [ ] `ec3.1` — Relocate `pipeline-state.json` from `.github/` root to per-artefact; add scanner for derived aggregate; add `featureStatus: complete` marker convention.

## Human Oversight Level

**Oversight:** Medium
**Rationale:** Touches every skill that writes pipeline state (a fan-out edit) and changes the source-of-truth location for the repository's primary continuity mechanism. Low-risk *structurally* (per-artefact sharding is simpler than locked-root) but high-reach — a botched relocation would blind every skill's state write.

## Complexity Rating

**Rating:** 3
**Notes:** Fan-out across all skills that write state; new scanner script; needs verification that the derived aggregate matches the previous root's content for existing features.

## Scope Stability

**Stability:** Stable — the principle (per-artefact + derived aggregate, mark-complete not delete) is nailed by decisions Q5. Implementation detail (scanner format, pointer-doc at root location) has minor variation but not scope-level.

## Integration notes

- Runs in parallel to epic-1 migrations in principle, but if ec3.1 ships **before** any ec1.x story, that ec1.x story's state writes must target the new per-artefact path. If ec3.1 ships **after** ec1.x stories, the scanner's first run folds ec1.x state into the aggregate from the root file as part of cut-over.
- ec2.1 (CONTRIBUTING.md) gains a seventh subsection describing the per-artefact state convention — that subsection must not be merged until ec3.1 is in-flight or complete, else the documented behaviour doesn't match the code.
