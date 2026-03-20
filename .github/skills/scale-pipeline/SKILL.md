---
name: scale-pipeline
description: >
  Designs an operating model to scale this skills pipeline from 1-2 teams to
  20-30 teams across mixed human and agentic delivery. Covers repo topology,
  state strategy, governance federations, and reliability controls.
---

# Scale Pipeline Skill

## Entry condition

None. Best run at programme setup and re-run at phase gates.

---

## Purpose

Define a scalable operating model for people, process, and state management.

---

## Step 1 — Scale profile

Capture target scale and constraints:
- Team count now and target
- Repo topology (mono-repo vs multi-repo)
- Compliance/audit needs
- Central vs federated governance preference

---

## Step 2 — Architecture options

Compare options for:
- Skill distribution model
- Shared templates and versioning
- State storage model (`pipeline-state.json` per repo vs aggregated index)
- Cross-team dependency visibility

Provide recommendation with trade-offs.

---

## Step 3 — Control plane design

Define minimum controls for scale:
- Version pinning of skill packs
- Change management for skill/template updates
- Backward compatibility policy
- Observability for pipeline health and stuck states

---

## Step 4 — Rollout plan

Produce phased rollout:
- Pilot (1-2 teams)
- Expansion (5-10 teams)
- Enterprise scale (20-30 teams)

Include success criteria and rollback criteria per phase.

---

## Output artefact

Use template: `.github/templates/scale-pipeline.md`

Save to:
- `.github/artefacts/[programme-slug]/scale-pipeline.md`

---

## State update — mandatory final step

Update `.github/pipeline-state.json` with scale phase and adoption notes.
Closing message must include: `Pipeline state updated ✅`
