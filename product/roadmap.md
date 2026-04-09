# Product Roadmap

## Adoption path

Squads adopt incrementally. Named patterns: **Subset** (current context only) → **Augment** (add as context expands) → **Progressive** (validate each addition before the next). The designs-in-hand variant applies for squads arriving with existing discovery artefacts — enter at Phase B without running Phase A.

---

## Phase 1–2 — Foundation, distribution, and self-improving harness

**Outcome:** A platform team can maintain the skills platform and at least two squads can consume skills without forking. The assurance agent runs as an automated CI gate. The improvement loop is operational. Context window management is structural. At least three core discipline standards are live.

### Phase 1 deliverables (summary)

- **Distribution + progressive skill disclosure** — versioned skill package model, tribe/squad override model, `copilot-instructions.md` as assembled base layer, on-demand skill loading, phase-sequenced progressive disclosure as formal context management pattern
- **Surface adapter model (foundations)** — `execute(surface, context) → result` interface; two-path surface type resolution (`context.yml` Path B in Phase 1; EA registry Path A in Phase 2); multi-surface declaration support; DoD criteria by surface type; git-native reference implementation
- **Assurance agent as CI gate** — CI-triggered assurance, `inProgress`→`completed` trace emission, structural CI gate checks (hash, agent independence, trace transition, watermark)
- **Watermark gate** — `workspace/results.tsv`, two-check gate logic, regression alert
- **`workspace/state.json` + `workspace/learnings.md`** — dual purpose: cross-session continuity and mid-session checkpoint; durable structured state separated from rendered context view; phase boundary ownership table; `/checkpoint` human override
- **Living eval regression suite** — `workspace/suite.json` auto-growing from assurance agent failure patterns
- **Standards model Phase 1** — software engineering, security engineering, quality assurance core standards + POLICY.md floors
- **Model risk documentation** — `MODEL-RISK.md` for regulatory audit readiness
- **Designs-in-hand workflow variant** — entry path for squads with existing discovery artefacts

### Phase 2 deliverables (summary)

- **Full platform adapter model** — remaining five surface adapters; **EA registry integration (Path A)** — automatic surface type classification and cross-platform dependency detection; Path B squads unaffected
- **Improvement agent** — stateless session design, two signal types (failure + staleness), queryable trace interface, challenger pre-check before human review
- **Cross-team observability** — skill usage registry, drift detection, contribution channel
- **Remaining discipline standards** — 8 remaining disciplines at core tier; domain-tier standards for pilot domains
- **Estimation calibration loop** — actual vs estimated velocity, calibration gaps to outer loop, EVAL.md estimation dimension

---

## Phase 3 — Enterprise scale and autoresearch

**Outcome:** 50 teams consuming the platform. Improvement loop operates at cross-team scale. Autoresearch runs continuously. Queryable trace interface promotes to cross-team registry.

### Phase 3 themes

- **Cross-team autoresearch** — improvement agent reads cross-team traces; failure and staleness patterns aggregate across squads; impact-ranked proposals
- **Cross-team trace registry** — squad-level queryable `getTraces(filter)` interface promotes to platform-level registry with squad/tribe/domain dimensions; OpenTelemetry standard adopted; `standards-composition` span added
- **Standards autoresearch** — recurring standards exceptions surface to CoP leads as proposed floor adjustments; CoP co-owner approval gate
- **Estimation calibration EVAL dimension** — real delivery records as corpus; calibration proposals from improvement agent
- **EA registry live integration** — live query at discovery; cross-platform dependency tracking
- **Squad-to-platform contribution flow** — governed contribution process distinct from platform engineer publish flow
- **Compliance monitoring report** — audit agent periodic attestation; platform team and risk function review

---

## Phase 4 — Adaptive governance and operational domains

**Outcome:** Platform governs operational runbooks, SaaS configuration, M365 administration. Agent identity established. Policy lifecycle formalised.

### Phase 4 themes

- **Operational domain standards** — incident response, change management, capacity planning
- **Agent identity layer** — signed identity per agent execution traceable to model version + instruction set version
- **Policy lifecycle management** — POLICY.md floor changes: proposal → review → staged rollout → measurement → retire or promote

*Note: Challenger model previously listed as Phase 4 ADR candidate — moved to Phase 2 as agent composition.*

---

## What is not on the roadmap

- The platform does not generate design artefacts — it references and validates them
- The platform does not replace Jira, Confluence, or project management tooling
- The platform does not host a persistent agent runtime
- The platform does not make compliance decisions — it produces compliance evidence for human review
