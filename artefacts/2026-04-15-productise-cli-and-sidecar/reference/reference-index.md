# Reference Index

**Feature:** Productise skills-repo — CLI + Sidecar
**Programme / initiative:** skills-repo productisation thread
**Last updated:** 2026-04-15

---

## Source documents

| File | Type | Owner | Relevance | Notes |
|------|------|-------|-----------|-------|
| 001-skills-repo-intro.md | Platform intro / factual analysis | Operator + Claude | What skills-repo is, what it does, how to use it, why relevant to AI-operator workflows | Authoritative intro. Covers pipeline, concepts (skill, adapter, assurance gate, pipeline state, eval suite, learnings, DoR/DoD, standards tiers), current phase status (Phase 1–3) |
| 004-skills-repo-as-product-strategy.md | Strategy document | Operator + Claude | Primary reference for this discovery | Defines the CLI + `.skills-repo/` sidecar + single `artefacts/` + `workflow.yaml` model. §12 Discussion identifies three tensions (skill visibility, workflow composition, evidence reproducibility) that must be resolved |

---

## Programme context

### Problem context
skills-repo today is a repo you clone; its governance files sprawl across the host project's `.github/`, `workspace/`, `standards/`, `artefacts/`, `src/`. Surveyed real projects — including reverse-fit cases where existing governance is materially different from skills-repo's defaults — cannot adopt cleanly. The README already names "consumption without forking" as a goal that the current clone model doesn't deliver. The productisation thread delivers skills-repo as an installable package + CLI.

### Stakeholders and sponsors
Single operator (repo owner) + Claude as agent. Upstream: `heymishy/skills-repo` (read-only reference). productisation working fork: `craigfo/skills-repo`.

### Related initiatives
- **skills-repo Phase 3 (in-flight)** — audit hardening, enterprise adapters, T3M1 gap closure. Architecturally adjacent to the productisation thread via p3.3 gate structural independence.

### Known constraints
Product-level constraints in `product/constraints.md` apply. Key ones for the productisation thread: C1 (update channel must never be severed), C5 (hash-verified instruction sets), C11 (no persistent agent runtime), C13 (structural governance preferred).

### Committed targets or deadlines
None committed externally. The productisation thread proceeds in parallel with Phase 3; no timeline coupling forced.
