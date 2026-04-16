---
name: org-mapping
description: >
  Maps this skills pipeline to organisation-specific language, governance steps,
  artefacts, and approval processes. Produces a translation matrix so teams can
  use local terminology while preserving pipeline integrity.
---

# Org Mapping Skill

## Entry condition

None. Run when adopting the pipeline in a new team or enterprise environment.

---

## Purpose

Create a durable mapping between:
- Pipeline skills/stages
- Organisation process names
- Governance gates and approvers
- Required artefacts and systems of record

---

## Step 1 - Capture organisation vocabulary

Collect current terms used by the organisation for:
- Discovery/requirements
- Delivery planning
- Build/test/validation
- Release/change management
- Operational review/benefit tracking

---

## Step 2 - Build skill/process mapping matrix

For each pipeline skill, map:
- Org process name
- Equivalent artefact(s)
- Required reviewer/approver role
- Control objective (if any)
- System of record (Jira, ServiceNow, GitHub, etc.)

Flag any unmatched process items (no current skill owner).

---

## Step 3 - Governance hooks

Define where governance checks happen in pipeline terms:
- Mandatory approvals
- Evidence required
- Policy exceptions path
- Audit trail location

---

## Step 4 - Context and adoption updates

Recommend updates to:
- `.github/context.yml` (naming aliases, governance fields)
- Onboarding docs
- PR templates/checklists

---

## Output artefact

Use template: `.github/templates/org-mapping.md`

Save to:
- `artefacts/[programme-slug]/org-mapping.md`
- Or `artefacts/[feature-slug]/org-mapping.md` for bounded pilots

---

## State update - mandatory final step

Update `artefacts/<current-feature-slug>/pipeline-state.json` notes with mapping completion status and
any unresolved governance gaps. Closing message must include: `Pipeline state updated ✅`

### Current-feature-slug derivation (ec3.1)

Before writing, resolve the current feature-slug. Write targets are per-feature now, not a shared root file.

1. **Preferred:** read `activeFeature.slug` from `workspace/state.json`.
2. **Fallback:** run `node scripts/current-feature-slug.js` (stdout emits the slug; exits 1 if unresolvable).
3. **Target:** write to `artefacts/<slug>/pipeline-state.json` — NOT `artefacts/<current-feature-slug>/pipeline-state.json` (that is a pointer doc since ec3.1; writes to it are forbidden).

If the slug cannot be resolved, halt with the helper's error message and do not write.
