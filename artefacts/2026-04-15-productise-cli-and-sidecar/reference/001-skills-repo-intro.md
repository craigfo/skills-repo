# skills-repo — Intro & Analysis

**Source:** `/Users/cf/analysis/workflow/skills-repo/`
**Date:** 2026-04-15
**Purpose:** Factual intro for the operator. What it is, what it does, how to use it, and why it is relevant to AI-operator workflows.

---

## 1. What it is

A **delivery-governance platform** for AI-assisted software work. It encodes delivery standards, quality gates, and discipline practices as **versioned, hash-verified instruction sets** (`SKILL.md` files) that AI agents execute against. Governance is **demonstrated by an auditable artefact chain**, not attested by memos.

Stated purpose (README.md):
> Delivery standards, quality gates, and discipline practices encoded as versioned, hash-verified instruction sets. Executed by AI agents inside GitHub Copilot. Verified automatically on every PR. No hosted service required.

Problems it targets:
1. Governance today is attested, not evidenced — no way to show which rules were in-context at decision time.
2. AI agents silently widen scope beyond what was agreed.
3. Teams that fork a standards repo can't sync upstream improvements.
4. Different delivery surfaces (IaC, SaaS-API, SaaS-GUI, M365 admin, manual) have different DoD shapes and lack a common governance model.
5. Standards degrade without a closed feedback loop from real delivery failures.

---

## 2. What it does

### Top-level layout

| Path | Role |
|---|---|
| `.github/skills/` | ~40 `SKILL.md` instruction sets organised by pipeline phase |
| `.github/templates/` | Markdown templates for every artefact (discovery, story, epic, test plan, DoR, DoD, …) |
| `.github/scripts/` | Node validators (governance-sync, skill-contract, artefact-path, assurance-gate) |
| `.github/workflows/` | CI gates (assurance gate on PR, post-merge trace commit, watermark gate) |
| `artefacts/<feature>/` | Per-feature discovery, benefit-metric, epics, stories, DoR, DoD, test plans, decisions |
| `workspace/` | Cross-session state: `state.json`, `suite.json`, `learnings.md`, `traces/`, `proposals/`, `results.tsv` |
| `standards/` | Discipline + surface + domain standards; each has `core.md` + `POLICY.md` floor |
| `src/` | Reusable executables: `surface-adapter`, `improvement-agent`, `approval-channel`, Bitbucket validators |
| `contexts/` | Install profiles (`personal.yml`, `work.yml`) copied to `.github/context.yml` |
| `product/` | mission/constraints/tech-stack/decisions/roadmap |
| `fleet/`, `fleet-state.json` | Multi-squad registry (Phase 2+; currently stub, Phase 3 expands) |

### The pipeline (three loops)

1. **Outer loop** (operator + agent, in conversation):
   `/discovery` → `/benefit-metric` → `/definition` → `/review` → `/test-plan` → **DoR gate**.
   Produces a fully specified, signed-off story before any code is written.
2. **Inner loop** (coding agent, scope-locked to the DoR contract):
   `/branch-setup` → `/implementation-plan` → `/tdd` + `/subagent-execution` → `/verify-completion` → `/branch-complete`.
3. **Assurance gate** (CI, every PR):
   Verifies skill-hashes against the registry, trace structure, DoD criteria, watermark; posts verdict + hash to the PR; post-merge workflow commits the trace to `workspace/traces/`.

### What the operator actually runs

- `cp contexts/personal.yml .github/context.yml` — set profile (toolchain, surfaces, disciplines, token policy)
- `npm test` — runs 22+ governance checks pre-commit
- `/workflow` — surfaces pipeline state and tells you the next skill
- `/discovery`, `/definition-of-ready`, `/definition-of-done`, `/improve` — phase entries
- Standard git PR flow; CI runs the assurance gate

---

## 3. Key concepts (as this repo uses them)

- **Skill** — a `SKILL.md` file: natural-language instruction set for one pipeline phase. Versioned, hash-verified, loaded only when its phase begins. Not a prompt template.
- **Surface adapter** — `execute(surface, context) → result` dispatcher. Six surfaces: git-native, iac, saas-api, saas-gui, m365-admin, manual. All adapters return the same result shape.
- **Assurance gate** — CI check that verifies hashes, trace structure, DoD criteria, and watermark. Evaluates governance, not code correctness.
- **Pipeline state** (`workspace/state.json`) — cross-session handoff record. New sessions read it and resume mid-pipeline without re-priming.
- **Eval suite** (`workspace/suite.json`) — 50+ scenarios, one per known failure pattern. Invariant: once added, must always pass. Guards harness behaviour, not product behaviour.
- **Learnings log** (`workspace/learnings.md`) — evidence-backed findings written by `/improve` at feature close; accumulates across features.
- **Traces** (`workspace/traces/*.jsonl`) — per-decision audit records: skill name, instruction-set hash, verdict, timestamp.
- **DoR artefact** — signed contract with 13 hard blocks (H1–H13) + 5 warnings. States what will be built, what will NOT be built, how each AC is verified. Immutable once signed.
- **DoD artefact** — post-merge validation: AC coverage, metric signal, deviations. Enables chain traceability: code ← PR ← trace ← DoD ← tests ← ACs ← story ← epic ← benefit-metric ← discovery.
- **Standards tiers** — discipline `core.md` (MUST/SHOULD/MAY) → discipline `POLICY.md` floor (binary MUST) → surface `POLICY.md` floor → optional domain floor → optional squad override. Composed into a single standards document injected at story start.

---

## 4. Why it is useful for AI-operator workflows

Concrete leverage points for operator↔Claude document creation, governance, and stage-gating:

1. **Template-enforced artefacts.** Discovery, stories, test plans, DoR/DoD all follow markdown templates with required fields. Claude produces conformant output by design; structure is validatable.
2. **Standards injected automatically.** `context.yml` + `standards/index.yml` route the right discipline/surface/domain policies into context at the phase boundary. Claude writes compliant by default, not by remembering.
3. **Falsifiable readiness gates.** The 13 DoR hard blocks are mechanical (persona present? ≥3 Given/When/Then ACs? no unresolved HIGH findings?). Incomplete work cannot advance — no human judgment call required.
4. **Contract-then-code.** The DoR Contract Proposal names exact touchpoints and out-of-scope items before implementation. The inner-loop coding agent cannot expand scope; the assurance gate rejects PRs whose changed files don't match.
5. **Cross-session continuity.** `workspace/state.json` lets the operator pause and resume in a fresh session with full orientation — no re-priming, no lost context.
6. **Evidence-based governance.** Every decision writes a hashed trace entry. Auditors walk the chain from merged code back to the original discovery. Governance is demonstrated, not claimed.
7. **Closed feedback loop.** `/improve` reads traces, the `improvement-agent` detects repeat failure patterns, proposes SKILL.md/standards diffs, runs a challenger pre-check, and routes to human review. Standards compound from real usage.
8. **Structured handoff.** `workspace/learnings.md` accumulates dated, evidence-backed findings — onboarding without a meeting.

### Concrete standards-flow example
`context.yml` declares `compliance.frameworks: [pci-dss]` → `/discovery` loads security + regulatory standards → downstream skills inherit them → `/review` hard-blocks on security POLICY violations → `/test-plan` requires a test per compliance AC → DoR H9 checks Architecture Constraints → inner-loop agent implements with standards already in context → DoD verifies coverage → `/improve` promotes reusable compliance patterns back into `standards/`.

---

## 5. Current phase status (April 2026)

- **Phase 1** (complete, 2026-04-09): distribution, progressive disclosure, assurance gate, watermark gate, state, eval suite, 3 anchor disciplines, model-risk docs. 7 stories, 66 passing tests.
- **Phase 2** (complete, 2026-04-11–13): skill upgrades, 5 surface adapters, approval-channel routing, improvement agent, remaining discipline standards, Bitbucket validation. 12 stories, 13 PRs. Outer loop ~2–3h/cycle, inner loop 20–40m/story, zero stories blocked.
- **Phase 3** (in-progress, started 2026-04-14): EA registry integration, cross-team observability, domain floors (fintech, healthcare, ecommerce), Windows validator, estimation calibration. 18 stories, 7 epics.

Known gaps: T3M1 independent audit 3/8, single approval channel, E3 estimation accuracy medium-low confidence, Windows validator pending.

---

## 6. Files to read first

- `README.md` — mission, principles, pipeline diagram
- `.github/copilot-instructions.md` — base agent instructions
- `.github/skills/<phase>/SKILL.md` — the executable rules
- `workspace/state.json`, `workspace/learnings.md` — what ongoing work looks like
- `artefacts/2026-04-11-skills-platform-phase2/` — fully worked delivery evidence
- `standards/index.yml` + one discipline `core.md`/`POLICY.md` — standards shape
