## Story: Add one local node to the workflow declaration — probe §16.2 / §16.9 customisation

**Epic reference:** `../epics/e5-customisation-mvp.md`
**Discovery reference:** `../discovery.md`
**Benefit-metric reference:** `../benefit-metric.md`

## User Story

As a **platform operator**,
I want to **add one custom local node to project 1's workflow declaration — a node referencing a local SKILL.md file that only project 1 has — and have it survive `upgrade`**,
So that **the §16.2 / §16.9 open question (consumer customisation semantics) is probed during MVP rather than deferred; if customisation works, the non-fork property is stronger; if it surfaces structural gaps, those gaps are known rather than latent**.

## Benefit Linkage

**Metric moved:** M5 (non-fork credibility); A-new (customisation authorability).
**How:** Non-fork adoption without customisation supports a narrower consumer base; consumers with genuine local needs must fork if customisation is blocked. Probing customisation early catches the mechanism's failure mode before it's a post-MVP adoption blocker.

## Architecture Constraints

- **C1 non-fork** — customisation must not push the consumer to a fork pattern.
- **C4 human approval** — local SKILL.md changes do not bypass human approval on their own merge path (separate from this feature's CLI customisation).
- **C5 hash-verified** — local SKILL.md is hashed and included in the lockfile with a `local: true` flag (or equivalent) distinguishing it from upstream pins.
- **Spike C addendum-1d** — local nodes and their SKILL.md files live outside the exclusion-list paths; the customisation mechanism does not touch `product/**`, `workspace/**`, etc.
- **ADR-013** — hash verification for local SKILL.md goes through the same shared-package path as upstream content.

## Dependencies

- **Upstream:** v2-e2e-project1 (customisation is probed on project 1).
- **Upstream:** v2-decl-outer-loop + v2-decl-inner-loop-support (declaration exists to customise).
- **Upstream:** v2-e2e-upgrade (customisation must survive an upgrade — upgrade behaviour is tested there first).
- **Downstream:** None.

## Acceptance Criteria

**AC1:** Given project 1's workflow declaration is pinned, When the operator authors a local `SKILL.md` file at a project-1-local path (outside managed paths), adds a corresponding node to the declaration referencing it, and commits, Then `skills-repo verify --declaration` passes: local node is valid, local skill-hash is computed and recorded, no constraints are violated.

**AC2:** Given the local node is declared, When the operator runs `skills-repo advance` reaching the local node, Then the CLI builds an envelope from the local SKILL.md (same mechanism as upstream), the agent produces output, the output-shape check applies per the local node's `expected-output-shape`, and a trace entry is emitted with `skillId` referencing the local node and `skillHash` matching the local file's SHA-256.

**AC3:** Given the local node is in place, When the operator runs `skills-repo upgrade` (an upstream skill change exists), Then the upgrade re-pins upstream content, the local SKILL.md file is NOT touched, and the local node's entry in the declaration is preserved with its original hash. The post-upgrade declaration still validates.

**AC4:** Given upgrade brought in an upstream change that conflicts structurally with the local node (e.g. upstream removed a node the local node depends on for transitions), When `upgrade` surfaces the diff, Then the conflict is named explicitly before operator confirmation; operator manually resolves before committing.

**AC5:** Given customisation is exercised end-to-end, When the operator journals the experience, Then any structural gaps (e.g. "local skill-hash check interferes with lockfile update semantics") are logged in `workspace/learnings.md` and, if they suggest the customisation shape needs revisiting, raised as a /decisions entry against §16.2.

## Out of Scope

- Replacing an upstream node with a local version — too invasive for MVP; prohibited by this story.
- Removing an upstream node — not in MVP.
- Customising skill hashes — would break P1; prohibited.
- Customisation UX polish (wizards, helpers) — manual authoring only for MVP.
- Cross-project customisation reuse (local skill shared between projects) — out of MVP.

## NFRs

- **Correctness:** Local SKILL.md hash must be verified on every advance the same way upstream is — no "local skips verification" path.
- **Audit:** Local node is distinguishable in the lockfile (`local: true` or equivalent); auditors can tell at a glance which content is upstream-pinned and which is local-authored.
- **Security:** Local SKILL.md content cannot declare or contain credentials (MC-SEC-02 inherits to local content).

## Complexity Rating

**Rating:** 3
**Scope stability:** Unstable — explicit probe; result may reshape discovery Out of Scope framing.

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story (depends on v2-e2e-project1 + v2-e2e-upgrade DoD)
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic (High)
