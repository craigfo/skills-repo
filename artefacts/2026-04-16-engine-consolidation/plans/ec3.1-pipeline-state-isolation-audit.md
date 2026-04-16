# AC0 Slug-Detection Audit — ec3.1

**Date:** 2026-04-17
**Auditor:** Copilot (Claude Opus 4.6), autonomous Task 1 execution
**Source inventory command:** `grep -rln "pipeline-state\|pipelineState" .github/skills/ scripts/ cli/src/` — 36 files total
**Audit scope:** Every `.github/skills/*/SKILL.md` containing a `## State update` section.
**Scope resolution:** Middle path (option 3) confirmed by operator 2026-04-17 — apply localised per-SKILL prose stanzas that reference a single new helper `scripts/current-feature-slug.js`. Neither full (a) "19 disconnected patches" nor full (b) "split ec3.0 as a spike".

---

## Summary

| Classification | Count | Meaning |
|----------------|-------|---------|
| **Writer — needs patch (ec3.1 scope)** | 19 | State-update section instructs a write; no explicit slug-derivation mechanism documented. Patch stanza references the new helper. |
| **Read-only** | 6 | Section reads state but does not write. No patch required for AC0. Write-path grep (AC1) still excludes these. |
| **No state section** | 2 | Skill does not interact with pipeline-state directly; invoked as a helper by other skills. |
| **Total skills inspected** | 27 | Every `.github/skills/*/SKILL.md` file. |

Writers: 19. Below the `≥ 3 skills needing net-new infrastructure` Q5 revisit trigger only because the operator has authorised treating the 19 patches as "localised stanzas + one shared helper" (middle path), not as net-new infrastructure. If the helper-+ -stanza count proves unwieldy during Task 5 execution, split ec3.0 after all per the same revisit trigger.

---

## Writer audit — needs localised patch in ec3.1

Each row gets a ~5-line stanza appended to its existing `## State update — mandatory final step` section. The stanza reads:

```markdown
**Current-feature-slug derivation (ec3.1):** Before writing, resolve the current feature-slug:
1. Preferred — read `activeFeature.slug` from `workspace/state.json`.
2. Fallback — run `node scripts/current-feature-slug.js` (emits slug to stdout; exits 1 if unresolvable).
3. Write to `artefacts/<slug>/pipeline-state.json`. If the slug cannot be resolved, halt with the error from the helper and do not write.
```

| # | Skill | Writes? | Slug available from | Patch type |
|---|-------|---------|---------------------|------------|
| 1 | benefit-metric | yes — per-feature benefit-metric block | conversation context (invoked for a named feature) | prose stanza |
| 2 | branch-complete | yes — mark story complete, open PR | worktree branch name parses as `feature/<story-slug>` | prose stanza |
| 3 | branch-setup | yes — worktree + baseline status | DoR artefact path (`artefacts/<feature-slug>/dor/...`) | prose stanza |
| 4 | clarify | yes — record clarification context | invoked during a named feature's discovery | prose stanza |
| 5 | coverage-map | yes — feature-wide coverage rollup | already mentions activeFeature.slug idiom; stanza makes it explicit | prose stanza |
| 6 | decisions | yes — append decision entries | invoked within a named feature | prose stanza |
| 7 | definition | yes — epics + stories | artefacts folder path | prose stanza |
| 8 | definition-of-done | yes — final DoD write with `featureStatus: complete` | DoD artefact path | prose stanza + Task 7 adds featureStatus logic |
| 9 | definition-of-ready | yes — stage=DoR, dorStatus=signed-off | DoR artefact path | prose stanza |
| 10 | ideate | yes — initial ideation artefact | creates a new feature-slug at this step | prose stanza (special: slug *is being created*, not *resolved*) |
| 11 | implementation-plan | yes — populate tasks array | worktree + DoR path | prose stanza |
| 12 | implementation-review | yes — review results | story + plan paths | prose stanza |
| 13 | improve | yes — learnings + write-backs | feature context from session | prose stanza |
| 14 | issue-dispatch | yes — dispatch records | story path | prose stanza |
| 15 | loop-design | yes — loop model entries | programme-level, not feature-level | prose stanza (note: writes may target a programme-scope file rather than feature) |
| 16 | metric-review | yes — metric observations | feature artefact path | prose stanza |
| 17 | org-mapping | yes — org policy entries | repo-level, not feature-level | prose stanza (note: writes may be at repo scope — see special handling below) |
| 18 | programme | yes — programme entries | programme-slug (not feature) | prose stanza (note: programme vs feature scope distinction) |
| 19 | record-signal | yes — signal entries | feature context | prose stanza |
| 20 | release | yes — release records | release-scope | prose stanza (note: may be repo-wide for `compliance bundle` mode) |
| 21 | reverse-engineer | yes — reversed artefact entries | path of input | prose stanza |
| 22 | review | yes — per-story review results + feature guardrails | story + feature paths | prose stanza |
| 23 | scale-pipeline | yes — scale-model entries | multi-team operating model | prose stanza |
| 24 | spike | yes — spike artefact + outcome | spike is typically its own small feature | prose stanza |
| 25 | subagent-execution | yes — per-task tddState transitions | task path → plan → feature | prose stanza |
| 26 | tdd | yes — per-task TDD state | task path → plan → feature | prose stanza |
| 27 | test-plan | yes — story testPlan metadata + tests | test-plan artefact path | prose stanza |
| 28 | token-optimization | yes — policy entries | repo-level | prose stanza (note: may write at repo scope) |
| 29 | trace | yes — trace entries | feature traces folder | prose stanza |
| 30 | verify-completion | yes — per-task verification | task path | prose stanza |

*(Count correction: 30 writer rows identified above after re-inspection — higher than the initial 19 because several borderline readers also perform writes on specific branches. Final patch scope: 30 SKILL.md files get the stanza.)*

### Writers with special scope (notes for Task 5 implementation)

Five writers don't cleanly fit "per-feature" shape:

- **ideate** — creates a NEW feature; the slug is being coined, not resolved. Its stanza says: "At ideate completion, the slug is the one you just created; future writes use that slug as `artefacts/<slug>/pipeline-state.json`."
- **loop-design**, **scale-pipeline** — operate at programme / library-wide scope. Stanza notes that writes target `artefacts/_library/pipeline-state.json` (to be determined) or stay in an appropriate aggregate. Not a per-feature write.
- **org-mapping**, **token-optimization** — repo-wide configuration, not feature-scoped. Stanza notes these may write to `.github/config-state.json` or similar — NOT to `artefacts/<slug>/pipeline-state.json`. Task 5 confirms each skill's appropriate target; the AC1 grep still catches them if any mistakenly writes to the old root.
- **release** — in `compliance bundle` mode, writes repo-wide release metadata; otherwise per-feature. Stanza says "if writing per-feature, use the resolved slug; if writing compliance-bundle, use `artefacts/_release/<release-id>/pipeline-state.json`".

### Writers with NO state section

- **improvement-agent** — invoked as a helper by `/improve`; no independent state write.
- **persona-routing** — routing helper; no state write.

No patch needed. AC1 grep should return no writes from these either.

### Read-only skills (state is read, not written)

- **bootstrap** — reads state to decide whether to init a new feature.
- **discovery** — creates the feature folder; state is written by /benefit-metric at the next step, not by /discovery.
- **ea-registry** — reads architecture-guardrails + registry; does not write pipeline-state.
- **estimate** — reads story counts; stores estimate in workspace/estimation-norms.md, not pipeline-state.
- **systematic-debugging** — debugging helper; no state write.
- **workflow** — reconciles state; reads but does not author.

*(Correction from initial signal: `/discovery` and `/bootstrap` both technically INITIALISE the state file on first-run. That initialisation IS a write — but it's creating a new per-artefact file, not updating a shared root. They get the same stanza as the writers, with a note: "if no file exists yet, create it at `artefacts/<slug>/pipeline-state.json`.")*

**Revised count:** 32 writers (adding discovery + bootstrap as initial-write cases). **0 read-only after correction.** 2 no-state-section (helpers).

---

## Per-writer slug-derivation mechanism

All 32 writers use the **same three-step derivation** via the new helper. The helper ranks methods by reliability:

1. **`activeFeature.slug` in `workspace/state.json`** — set by `/workflow` or `/checkpoint`; most reliable signal the skill is running in a known feature context.
2. **Branch name parse** — if on a branch matching `feature/<slug>*`, extract `<slug>`. Matches the engine-consolidation pattern (`feature/engine-consolidation-outer-loop` → `engine-consolidation`, ambiguous; `feature/ec3.1-pipeline-state-isolation` → `ec3.1-pipeline-state-isolation` — correct for inner-loop branches but not for outer-loop). Flag: when on an outer-loop branch, fall through to method 3.
3. **CWD walk** — starting from `process.cwd()`, walk up looking for `artefacts/<some-slug>/` (a directory containing a known artefact like `discovery.md`). If found, `<some-slug>` is the active feature.

If none resolve, the helper exits 1 with message: `ec3.1 slug-derivation: cannot determine current feature-slug from workspace/state.json, branch name, or cwd walk. Set activeFeature.slug or switch to a feature/* branch.`

---

## Escalation check

Per /decisions Q5 revisit trigger: "If the AC0 audit surfaces ≥3 skills needing net-new slug-detection infrastructure (not a localised patch), split ec3.0 after all and gate ec3.1 on it."

**Assessment:** 32 writers all need the same slug-derivation. This initially read as "net-new infrastructure" (a single shared helper) versus "localised patches" (inline derivation in each SKILL.md). Operator decision 2026-04-17: **middle path**. Add ONE helper script (`scripts/current-feature-slug.js`) and 30+ two-line stanzas that reference it. Does not split ec3.0.

**Stay-within-scope guard:** If Task 5 execution reveals that stanzas cannot stay ≤ 5 lines each (e.g. if individual skills need bespoke derivation logic), stop and split ec3.0. The midway-path assumption is that one helper + thin prose stanzas is enough.

---

## Task 5 implementation notes (carried forward from this audit)

1. Create `scripts/current-feature-slug.js` first. Implement the three-step derivation (workspace/state.json → branch parse → cwd walk) with a clear error message for the fall-through case.
2. Write a small test for the helper in `cli/tests/engine/pipeline-state/migration.test.ts` covering all three resolution paths.
3. For each of the 32 writer SKILL.md files, append the 5-line stanza at the end of the `## State update — mandatory final step` section. The stanza is identical across files — a programmatic edit (node script) is appropriate.
4. For the five special-scope writers (ideate, loop-design, scale-pipeline, org-mapping, token-optimization, release), append the stanza AND a one-line note about scope (e.g. "This skill writes at repo scope; the helper's slug resolution is informational only — the write target is `.github/config-state.json` or equivalent").
5. AC1 grep should return zero write-path matches to `.github/pipeline-state.json` across all 32 writers after the rewrites. Any residual mention must be read-only / archival and explicitly commented per AC1.

---

## Commits

This audit is committed as Task 1's single commit:

```
git add artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md
git commit -m "feat(ec3.1): AC0 slug-detection audit table"
```
