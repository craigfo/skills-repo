## Epic: `CONTRIBUTING.md` and `product/*` reflect the new control-plane layout

**Discovery reference:** `artefacts/2026-04-16-engine-consolidation/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-16-engine-consolidation/benefit-metric.md`
**Slicing strategy:** Vertical slice — each document is a single PR.

## Goal

A new contributor cloning the repo can read `CONTRIBUTING.md` and know who owns what, where proposals go, how to signal in-flight work, and how PRs are reviewed. `product/roadmap.md` names the Productisation thread as a live workstream. `product/tech-stack.md` describes the post-consolidation engine layout (single `cli/` home; `src/` deprecated). `product/decisions.md` carries the ADR recording the control-plane principle as the accepted architectural direction.

These land regardless of the subcomponent-migration epic's completion status — documentation about the target state is useful even partway through the migration.

## Out of Scope

- **Changes to `SKILL.md` or standards content.** Governed by the C4 human-approval gate; not touched here.
- **Auto-generated CODEOWNERS file activation.** The proposed scope-ownership table in `CONTRIBUTING.md` is documentation first; `CODEOWNERS` as an activated GitHub review-routing file is a separate decision (flagged in 006 as an open question).
- **The `.github/scripts/` collapse feature's `product/*` impact.** When that follow-up feature runs, it amends `product/tech-stack.md` again. This epic lands the current-shape description.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|----------------------|
| M3 CONTRIBUTING.md + product/* landed | 0 of 4 | 4 of 4 | Each story lands one or more of the target files. |

## Stories in This Epic

- [ ] `ec2.1` — Add `CONTRIBUTING.md` at repo root (scope ownership, proposal process, WIP signalling, **pipeline-state coordination** — subsection 7 per decisions Q5, sequencing-gated on ec3.1).
- [ ] `ec2.2` — Apply `product/*` edits (roadmap append, tech-stack amend, decisions ADR).

## Human Oversight Level

**Oversight:** Low
**Rationale:** Documentation only; no code paths touched. Content derives directly from the 006 proposal — this is translation, not original design.

## Complexity Rating

**Rating:** 1

## Scope Stability

**Stability:** Stable
