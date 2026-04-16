# Benefit Metric: Engine consolidation (CLI as control plane)

**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Date defined:** 2026-04-16
**Metric owner:** Operator (productisation-thread contributor)

---

## Tier Classification

**⚠️ META-BENEFIT FLAG:** Yes
<!--
This feature is primarily a structural-governance validation: does the
control-plane principle (006) land cleanly in code, such that
downstream features (005 Gate 4, 005 Gate 3 LLM bridge, any operational
skills) can build on a single authoritative engine location without
re-litigating the direction? User-outcome metrics are secondary — the
user-facing CLI's behaviour is unchanged by this feature. Meta-outcomes
(principle realised, parallel approach validated, no Phase 3 collisions)
are primary.
-->

---

## Tier 1: Product Metrics (Structural Outcomes)

### Metric M1: `src/*` → `cli/` migration completeness

| Field | Value |
|-------|-------|
| **What we measure** | Count of targeted subcomponents whose source code has been moved out of `src/<subcomponent>/` and into `cli/src/<destination>/`, with accompanying tests co-located per the migration table. |
| **Baseline** | 0 of 7 migrated. 2 test files (`.github/scripts/check-surface-adapter.js`, `check-suite.js`) still in their original locations. |
| **Target** | 7 of 7 migrated. Both test files relocated. `src/` directory contains no executable files (optional `DEPRECATED.md` marker acceptable). |
| **Minimum validation signal** | ≥6 of 7 migrated, with the same number of corresponding test files moved. Tolerates one subcomponent legitimately deferred due to a Phase 3 collision, with the deferral logged via `/decisions`. |
| **Measurement method** | `find src/ -type f \( -name "*.js" -o -name "*.ts" \) \| wc -l` — target 0. Confirmed at feature DoD. |
| **Feedback loop** | If any subcomponent is not migrated, understand why (Phase 3 collision, technical blocker, coverage gap discovered) and either defer with a logged reason or resolve the blocker. Unresolved migrations carry forward to a named follow-up feature. |

### Metric M2: Pre/post test invariant preserved per subcomponent

| Field | Value |
|-------|-------|
| **What we measure** | For each subcomponent's migration PR: pre-migration test count + pass rate on the subcomponent's existing test file(s) = post-migration test count + pass rate. |
| **Baseline** | Captured at each story's `/branch-setup` time — pre-migration run of existing tests, count + pass rate recorded in the story's DoD evidence block. |
| **Target** | 100% match across all 7 subcomponent PRs. |
| **Minimum validation signal** | 100% match — any drift blocks the specific story's PR until resolved or the deviation is logged as RISK-ACCEPT via `/decisions`. |
| **Measurement method** | Story DoD artefact records pre-migration and post-migration test output side by side. Feature-level aggregate at DoD close. |
| **Feedback loop** | On drift: investigate root cause (implicit coupling, path assumption, test harness quirk); fix; re-run. If drift is irreducible and RISK-ACCEPT'd, the migration pattern itself needs review. |

### Metric M3: `CONTRIBUTING.md` + `product/*` edits landed

| Field | Value |
|-------|-------|
| **What we measure** | Presence (on `develop`) of: new `CONTRIBUTING.md` at repo root; `product/roadmap.md` with Productisation thread appended; `product/tech-stack.md` with the single-`cli/` engine layout; new ADR in `product/decisions.md` recording the control-plane framing. |
| **Baseline** | None of these exist in current form. |
| **Target** | All 4 present on `develop` at feature DoD. |
| **Minimum validation signal** | Same as target (binary). |
| **Measurement method** | `git ls-files` check at feature DoD. |
| **Feedback loop** | Doc-level artefact; if missing at DoD, hold ship until added. |

### Metric M4: Host-repo cleanliness post-migration

| Field | Value |
|-------|-------|
| **What we measure** | `src/` directory contents after all 7 migration PRs merge. |
| **Baseline** | `src/` contains 16 `.js` files across 7 subcomponent directories + 1 `definition-skill/`. |
| **Target** | `src/` contains 0 executable files. Optional `src/README.md` noting deprecation + pointing at `cli/`. |
| **Minimum validation signal** | `src/*` directories may remain empty as placeholders; 0 executable files the condition. |
| **Measurement method** | `find src -type f -name "*.js" -o -name "*.ts" -o -name "*.mjs"` — target 0. |
| **Feedback loop** | Any remaining executable indicates an incomplete migration; either complete it or defer with a logged reason. |

---

## Tier 2: Meta Metrics (Thesis Validation)

### Meta Metric MM1: Control-plane principle realised structurally

| Field | Value |
|-------|-------|
| **Hypothesis** | The CLI-as-structural-authority claim (006 Part 1) can be enforced in code, not just prose. After migration, no platform-internal component previously invoked outside the CLI remains invokable outside the CLI. |
| **What we measure** | Count of `.github/scripts/` or other non-`cli/` entry points that still reference `src/<subcomponent>/` by path, require, or import. |
| **Baseline** | At least 2 today — `.github/scripts/check-surface-adapter.js` and `check-suite.js` resolve `src/surface-adapter/` and `src/suite-parser/` paths. Plus any downstream `.github/workflows/` that invoke these. |
| **Target** | 0 references to `src/<migrated-subcomponent>/` from outside `cli/` at feature DoD. |
| **Minimum validation signal** | 0. A single residual reference = principle not fully enforced — that subcomponent's migration isn't done. |
| **Measurement method** | `grep -r "src/<subcomponent>" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=src` for each of the 7 subcomponents. Feature DoD gates on all 7 returning 0. |

### Meta Metric MM2: Parallel migration approach validated

| Field | Value |
|-------|-------|
| **Hypothesis** | At solo scale, 7 subcomponent migrations can proceed in parallel (per Q1 decision) without producing significant cross-branch collisions. |
| **What we measure** | Count of merge conflicts encountered when integrating the 7 feature branches back into `develop`. |
| **Baseline** | 0 (nothing merged yet). |
| **Target** | 0 cross-branch conflicts at integration time. |
| **Minimum validation signal** | ≤1 resolvable collision across all 7 branches. ≥2 collisions means the parallel assumption was too aggressive for this scale — log as learning for future migration-shaped features. |
| **Measurement method** | Each PR's merge status + `git merge` output recorded in its DoD evidence. Feature-level aggregate at DoD close. |
| **Feedback loop** | If the invariant breaks, Q1's parallel decision gets re-scoped for future work; sequential becomes the default unless explicitly argued otherwise. |

### Meta Metric MM3: Phase 3 contributor experiences no blocking collisions

| Field | Value |
|-------|-------|
| **Hypothesis** | Migration can run on `develop` in parallel with the upstream Phase 3 contributor's in-flight work without blocking either side (per constraint E.1). |
| **What we measure** | Count of blocking incidents during the migration window — a "blocking incident" = Phase 3 contributor signals a collision that pauses one of our migrations, OR we push something that requires Phase 3 to pause. |
| **Baseline** | 0 today. |
| **Target** | 0 blocking incidents. |
| **Minimum validation signal** | ≤1 incident that was resolved with a coordination pause + sequencing adjustment. |
| **Measurement method** | Operator logs any Phase 3 coordination event in `workspace/productisation-incidents.md` (file exists from ps3.3 dogfood; reuse it as the incident register). |
| **Feedback loop** | If ≥1 incident: document in incidents file; coordinate with Phase 3 contributor; adjust the `CONTRIBUTING.md` WIP-signalling convention if the collision would have been avoidable with better signalling. |

### Meta Metric MM4: Pipeline-state write contention eliminated structurally

**Added 2026-04-16 per `decisions.md` Q5 (ARCH scope-add).** This metric is bipartite: part (a) is measured at feature DoD; part (b) is a post-ship operational signal.

| Field | Value |
|-------|-------|
| **Hypothesis** | Concurrent contributors writing pipeline state to a single shared root file (`.github/pipeline-state.json`) race on every phase-boundary write. Sharding writes to per-artefact files — with the root becoming a derived aggregate — eliminates the contention without losing the cross-feature view. |
| **What we measure** | **(a) Structural, at feature DoD:** count of non-read-only references to `.github/pipeline-state.json` from `.github/skills/`, `scripts/`, and `cli/`. **(b) Operational, 30 days post-ship of ec3.1:** count of git merge conflicts or lost-write incidents on pipeline-state JSON paths across concurrent feature work. |
| **Baseline** | (a) ≥1 today — every skill that writes state targets the root file (38K-token single shared write target). (b) Risk present today: two concurrent contributors (productisation + Phase 3) writing the same root file. |
| **Target** | (a) 0 non-read-only root-file references (read-only scanner and archival-pointer paths are exempt and explicitly enumerated). (b) 0 conflicts across the 30-day window. |
| **Minimum validation signal** | (a) 0 — binary, checked at DoD. (b) ≤1 conflict logged with root cause + follow-up action; ≥2 means sharding was insufficient (likely slug-detection wrong) — re-scope the split. |
| **Measurement method** | (a) `grep -rn "\.github/pipeline-state\.json" .github/skills/ scripts/ cli/`, excluding the aggregate-scanner source and the AC5 pointer-doc path (if that variant landed). (b) `git log --diff-filter=U` on `**/pipeline-state*.json` paths over the 30-day window, cross-checked against `workspace/productisation-incidents.md`. |
| **Feedback loop** | If (a) non-zero: the offending skill is an escape-hatch write; amend. If (b) non-zero: investigate whether slug-detection is wrong or the active feature-slug was ambiguous; log learning and refine the scoping logic. |

---

## Tier 3: Compliance / Risk Metrics

**None applicable.** No regulatory framework triggered. Product-level constraints C3 (spec immutability), C4 (human approval gate for SKILL.md/POLICY.md changes), C5 (hash-verified instruction sets), C13 (structural governance preferred) apply as internal platform constraints. This feature honours them by not touching SKILL.md content, not modifying standards floors, and not removing hash-verification surface area.

---

## Metric Coverage Matrix

| Metric | Tier | Contributing stories |
|---|---|---|
| M1 — migration completeness | 1 | ec1.1, ec1.2, ec1.3, ec1.4, ec1.5, ec1.6, ec1.7 |
| M2 — pre/post test invariant | 1 | ec1.1, ec1.2, ec1.3, ec1.4, ec1.5, ec1.6, ec1.7 |
| M3 — CONTRIBUTING.md + product/* landed | 1 | ec2.1, ec2.2 |
| M4 — host-repo cleanliness | 1 | aggregate (ec1.1–ec1.7 collectively); no single story owns it |
| MM1 — control-plane principle realised | 2 | ec1.1, ec1.2, ec1.3, ec1.4, ec1.5, ec1.6, ec1.7 |
| MM2 — parallel approach validated | 2 | aggregate; measured at integration time |
| MM3 — no Phase 3 blocking | 2 | ec1.1, ec1.2, ec1.3, ec1.4, ec1.5, ec1.6, ec1.7 (each surfaces collisions); aggregate at DoD |
| MM4 — pipeline-state contention eliminated | 2 | ec3.1 (structural, at DoD); aggregate 30 days post-ship (operational) |

---

## Deferred — not metrics for this feature

- **`.github/scripts/` collapse outcomes** — deferred to the future-follow-up feature (per decisions.md Q3). Relevant metrics will live with that feature's benefit-metric, likely including: count of duplicator scripts replaced by CLI invocations, count of hygiene validators unchanged, `verify --ci` existence.
- **LLM-bridge outcomes (005 Gate 3)** — different feature. `cli/src/engine/story/` (Q4 destination) will be one of its consumers, but the bridge's own metrics live in its own benefit-metric.
- **Upstream alignment with heymishy on 006** — tracked via the cross-fork PR's review status, not as a metric on this feature. If heymishy rejects the principle, this feature closes (downstream fork) or replans (rethink); either outcome is an alignment question, not a measured metric.
