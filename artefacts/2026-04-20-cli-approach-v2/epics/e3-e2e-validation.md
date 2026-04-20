## Epic: End-to-end validation across two existing projects

**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-20-cli-approach-v2/benefit-metric.md`
**Slicing strategy:** Risk-first

## Goal

The operator completes at least one full feature cycle end-to-end on each of the two validation projects via the CLI (full workflow graph exercised), and runs `upgrade` at least once. Live-usage fidelity (P1–P4 roll-up across emitted traces, not just harness tests) is observable. Non-fork property survives `upgrade`. Cross-project quirks surface on project 2 that didn't appear on project 1. The feature moves from "scaffolded tool" to "operator-usable tool with adoption evidence."

## Out of Scope

- External (second-party) consumer validation — out of MVP per Q3 DESIGN decision; follow-on.
- Upgrade UX for breaking skill-content changes — deferred per discovery Out of Scope.
- Customisation during a cycle — Epic 5 explores.
- Cross-runtime hash equivalence at full fidelity (MM2) — smoke tested here; full proof out of MVP.

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|------------------------|
| MM1 — Real end-to-end adoption fidelity | 0 full cycles | ≥2 full cycles (1 per project) | Every story in this epic is a real feature cycle; MM1's primary signal. |
| M5 — Non-fork adoption | 1/2 projects (from Epic 1) | 2/2 projects + ≥1 upgrade cycle | Project 2 install + upgrade both exercise the non-fork property in anger. |
| M1, M2, M3, M4 (live signal) | Harness-only signal after Epics 1+2 | Live-trace signal across real cycles | Live traces from real use supplement the harness signal and surface gaps the harness missed. |
| A4 — seam envelope sufficiency | Unvalidated | Validated or failed across ≥2 agent sessions | First live use tests whether envelope is sufficient or ambient context is needed. |
| MM2 — Workflow portability | 0 cross-runtime pairs | ≥1 hash-equivalent pair observed | Smoke signal only — full proof is a follow-on. |

## Stories in This Epic

- [ ] v2-e2e-project1 — First feature cycle on project 1 end-to-end via CLI (full graph)
- [ ] v2-e2e-project2 — Second feature cycle on project 2 (cross-project quirks surface)
- [ ] v2-e2e-upgrade — Upgrade cycle on ≥1 project (update-channel validation)

## Human Oversight Level

**Oversight:** High
**Rationale:** This epic exercises the tool against real work. Every cycle is observable but costly to rerun (a blown cycle means a real project's work is affected). Operator reviews each cycle's outcomes and classifies CLI-attributable vs project-specific blockers.

## Complexity Rating

**Rating:** 3

## Scope Stability

**Stability:** Unstable — projects will surface unexpected structure; agents may behave differently between projects; envelope sufficiency is the bet being validated.
