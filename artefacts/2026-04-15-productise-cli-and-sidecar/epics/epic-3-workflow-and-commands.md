## Epic: Workflow schema, commands, and dogfood acceptance — the backbone becomes a product

**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`
**Slicing strategy:** Walking skeleton

## Goal

The hard-coded single-step workflow from Epic 1 is replaced with a real `workflow.yaml` schema and one published preset (`story-unit-min`). `run next` resolves steps against the preset; `status` reports current position; `artefact new` scaffolds a new feature folder. The skills-repo maintainer runs the full chain end-to-end on a clean dogfood test repo and produces at least one complete artefact chain via the CLI — satisfying MM1 and exercising MM2 (§12-tension incident tracking).

## Out of Scope

- `workflow validate` refusal of invalid sequences — OOS per discovery (#10 in Out of Scope). Loud documentation only at MVP.
- `verify --ci` GitHub Actions workflow — OOS per discovery (#3).
- Custom workflows hand-authored by the operator — MVP supports the bundled preset only.
- Multiple presets (`story-unit-full`, `research-experiment`, etc.) — one preset at MVP; additional presets are post-MVP.
- External-adopter acceptance pass — OOS (#16); dogfood-only.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| M2 — Time-to-first-artefact | N/A (new) | <15 min | Full UX path exists end-to-end in this epic; measured in ps3.3. |
| M3 — Resume-after-pause works | N/A (new) | Pass (binary) | `status` + state checkpointing proves resume; validated in ps3.3. |
| MM1 — Dogfood delivery on packaged CLI | 0 | ≥1 full chain before ship | ps3.3 *is* the dogfood run. |
| MM2 — No §12-tension incidents during MVP | 0 | 0 | Incident tracking file opened and reviewed during ps3.3. |

## Stories in This Epic

- [ ] `ps3.1` — `workflow.yaml` schema + one real preset; `run next` resolves against it — `stories/ps3.1-workflow-schema-and-preset.md`
- [ ] `ps3.2` — `status` and `artefact new` commands — `stories/ps3.2-status-and-artefact-new.md`
- [ ] `ps3.3` — Dogfood acceptance run on a clean test repo — `stories/ps3.3-dogfood-acceptance-run.md`

## Human Oversight Level

**Oversight:** Medium

## Complexity Rating

**Rating:** 2

## Scope Stability

**Stability:** Stable
