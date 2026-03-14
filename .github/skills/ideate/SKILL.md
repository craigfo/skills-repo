---
name: ideate
description: >
  Structured product discovery and ideation. Reads existing pipeline artefacts
  (discovery.md, benefit-metric.md, stories, reference materials) and applies
  structured frameworks to explore the opportunity space before, during, or
  alongside the pipeline. Offers four lenses: opportunity mapping (Torres),
  assumption inventory (Torres), market and competitive scan, and product
  strategy framing (Cagan). Produces structured artefacts that feed
  /discovery, /benefit-metric, or /definition. Safe to run at any stage —
  does not replace /discovery, enriches and precedes it.
triggers:
  - "ideate"
  - "ideation"
  - "explore opportunities"
  - "what should we build"
  - "what should we build next"
  - "what do users need"
  - "opportunity mapping"
  - "opportunity tree"
  - "assumption mapping"
  - "what are we assuming"
  - "stress-test our assumptions"
  - "market research"
  - "competitive analysis"
  - "continuous discovery"
  - "product discovery"
  - "product strategy framing"
  - "torres"
  - "cagan"
---

# Ideate Skill

## Entry condition

None. Safe to run at any point — on a blank slate, alongside an active
discovery, or before starting any formal pipeline stage.

---

## Step 1 — Load context

Before asking anything, check what artefacts exist for the current feature or
project. Look for:

- `.github/artefacts/[feature-slug]/reference/` — source documents
- `.github/artefacts/[feature-slug]/discovery.md`
- `.github/artefacts/[feature-slug]/benefit-metric.md`
- `.github/artefacts/[feature-slug]/stories/` — any stories already written
- `.github/pipeline-state.json` — current feature list and stages

State what you found:

> **Context loaded:**
> - Discovery: ✅ found ([status]) / ❌ not yet written
> - Benefit metrics: ✅ found ([n] metrics defined) / ❌ not yet written
> - Stories: [n] written / none yet
> - Reference materials: [list filenames] / none
>
> I'll use these to ground the ideation in what's already known.
> What is the focus for this session?
>
> 1. A new feature or initiative not yet in the pipeline
> 2. An existing feature — exploring whether the scope is right
> 3. What to build *next* after the current feature
> 4. A specific customer problem we want to investigate more deeply
>
> Reply: 1, 2, 3, or 4 — or describe in your own words

---

## Step 2 — Choose lenses

> **Which structured lens(es) do you want to apply?**
>
> A. **Opportunity mapping** — map the opportunity space: unmet needs, pain
>    points, and desires. Structures them into an opportunity solution tree.
>    *Framework: Teresa Torres — Continuous Discovery Habits*
>
> B. **Assumption inventory** — surface every assumption baked into the
>    current scope or idea. Categorise by risk. Identify which to test first.
>    *Framework: Teresa Torres — assumption mapping*
>
> C. **Market and competitive scan** — structured research questions to run
>    against external sources. Covers: who else is solving this, for whom,
>    and on what dimension are we different?
>
> D. **Product strategy framing** — opportunity assessment and product
>    strategy questions to test whether this is the right bet.
>    *Framework: Marty Cagan — SVPG product discovery*
>
> You can run one lens or all four. I'll run them in order.
>
> Reply: A, B, C, D — or any combination (e.g. A C)

---

## Lens A — Opportunity mapping

*Based on Teresa Torres, Continuous Discovery Habits: the opportunity solution tree.*

The tree has three layers:
1. **Desired outcome** — the business or product result we want to move
2. **Opportunities** — the unmet needs, pain points, and desires in the way of that outcome
3. **Solutions** — ideas that could address one opportunity

### A1 — Identify the desired outcome

If a benefit-metric artefact exists, use the defined metrics as the desired
outcome and confirm:

> **Desired outcome (from benefit-metric.md):**
> [metric name and target]
>
> Is this still the right outcome for this ideation session?
> Reply: yes — or describe a different outcome

If no benefit-metric exists, ask:

> **What outcome does this need to move?**
> Be specific — not "improve the product", but "reduce the time a facilitator
> spends setting up a session from 10 minutes to under 2 minutes".
>
> Reply: describe the outcome

### A2 — Map opportunities

Opportunities are **customer experiences to improve** — framed as unmet needs,
pain points, or desires. They are NOT solutions. They must be neutral enough
that multiple solutions could address each one.

Ask:

> **What observations, feedback, or evidence do you have about where customers
> struggle or what they want in this area?**
>
> Be as specific as possible. If you have quotes or described behaviours, include them.
> I'll help structure them into opportunities.
>
> Reply: describe what you know — or "I don't have direct evidence yet" and I'll
> help generate research questions to fill the gap

After the user answers, synthesise into opportunity clusters and present:

> **Opportunity map (draft):**
>
> Outcome: [outcome]
>
> ├── Opportunity cluster 1: [theme]
> │   ├── [specific opportunity — unmet need / pain point / desire]
> │   └── [specific opportunity]
> ├── Opportunity cluster 2: [theme]
> │   └── [specific opportunity]
> └── [emerging opportunity — worth investigating but not yet evidenced]
>
> How does this look? Missing anything?
> Reply: looks right — or correct / add [specific thing]

### A3 — Prioritise

Ask:

> **Which opportunities are most important and most underserved?**
>
> For each cluster, rate:
> - **Importance:** how much does your customer care about this? (High / Medium / Low)
> - **Current satisfaction:** how well is this served today by existing solutions? (High / Medium / Low)
>
> The best opportunities are high importance + low current satisfaction.
>
> Reply: rate each — or "I don't know, help me think through it"

Present a prioritised opportunity table:

> | Opportunity | Importance | Current satisfaction | Priority |
> |-------------|-----------|---------------------|----------|
> | [opportunity] | High | Low | 🟢 Top |
> | [opportunity] | Medium | Medium | 🟡 Watch |
> | [opportunity] | Low | High | ⚪ Pass |

### A4 — Seed solutions

For the top 1–2 opportunities only:

> **For [top opportunity], what solutions come to mind?**
>
> At this stage solutions are hypotheses, not commitments. Wide thinking is
> better than narrow. Include ideas that seem obvious and ideas that seem odd.
>
> Reply: list ideas — or "I have no ideas yet, prompt me with some directions"

Record solutions as hypotheses linked to their parent opportunity. These feed
directly into /discovery as potential scope options.

---

## Lens B — Assumption inventory

*Based on Teresa Torres — assumption mapping.*

Every product decision bakes in assumptions. Making them explicit and testing
the riskiest ones first prevents building a fully-working solution to the wrong
problem.

### B1 — Extract assumptions from artefacts

If artefacts exist, scan them and extract all baked-in assumptions. Categorise
each by type:

| Type | Question it answers |
|------|---------------------|
| **Desirability** | Do customers want this? Will they use it? |
| **Viability** | Will this work for the business? Can we sustain it? |
| **Feasibility** | Can we build this with the time, tech, and skills we have? |
| **Ethical** | Should we build this? What are the unintended consequences? |

Present the extracted assumptions:

> **Assumptions I found in the artefacts:**
>
> *Desirability:*
> - [assumption — e.g. "Facilitators want to reuse sessions across workshops"]
>
> *Viability:*
> - [assumption — e.g. "The workshop canvas can be offered as a free tool and funded by adjacent paid features"]
>
> *Feasibility:*
> - [assumption — e.g. "Client-side drag-and-drop can be implemented in two sprints"]
>
> *Ethical:*
> - [assumption — e.g. "Storing session data locally is acceptable to users"]
>
> What's missing? Any assumptions I haven't surfaced?
> Reply: add [specific assumption] — or looks complete

### B2 — Prioritise by risk

Ask for each assumption (or have the user rate them):

> **For each assumption, rate:**
> - **Risk if wrong:** how bad is it if this assumption turns out to be false? (High / Medium / Low)
> - **Known-ness:** how well evidenced is this assumption already? (Evidence / Inference / Guess)
>
> The riskiest assumptions to test first are: High risk + Guess.
>
> Reply: rate each — or "prompt me through them one at a time"

Present the prioritised assumption map:

> | Assumption | Type | Risk if wrong | Known-ness | Priority |
> |-----------|------|--------------|------------|----------|
> | [assumption] | Desirability | High | Guess | 🔴 Test first |
> | [assumption] | Feasibility | Medium | Inference | 🟡 Test before build |
> | [assumption] | Viability | Low | Evidence | 🟢 Accept |

### B3 — Suggest tests

For each 🔴 assumption:

> **To test "[assumption]", the smallest experiment might be:**
>
> - **Interview approach:** [specific question to ask in a customer conversation]
> - **Prototype test:** [what to show and what to observe]
> - **Data proxy:** [existing data that would give a signal without building anything]
>
> Which of these is feasible right now?
> Reply: [interview / prototype / data] — or "none, acknowledge as risk and proceed"

If "acknowledge as risk" — add to /decisions as RISK-ACCEPT with the assumption
stated explicitly. Flag it in the ideation artefact.

---

## Lens C — Market and competitive scan

This lens generates structured research questions. The user runs these against
external sources (web search, industry reports, user interviews, competitor
demos). Findings are returned and synthesised into the artefact.

### C1 — Frame the scan

> **To frame the scan, confirm:**
>
> 1. Who is the primary customer/user? (brief description)
> 2. What is the core job-to-be-done they are trying to accomplish?
> 3. What is the main category this product/feature sits in?
>
> Reply: answer each, or "use what's in the discovery artefact"

### C2 — Generate research questions

Produce a structured set of research prompts across six dimensions:

> **Research questions — take these to external sources:**
>
> **Dimension 1: Customer problem evidence**
> - How do [primary customers] currently solve [job-to-be-done] without this product?
> - What do they complain about with existing approaches? (search forums, reviews, social)
> - What language do they use to describe the problem? (important for messaging)
>
> **Dimension 2: Existing solutions**
> - What products/tools directly compete with this feature?
> - What does each solution do well? What do customers complain about?
> - Are any of these growing fast or losing ground — and why?
>
> **Dimension 3: Adjacent solutions**
> - What products solve a related problem for the same customer?
> - Could any adjacent solution expand to compete with this?
>
> **Dimension 4: Market signals**
> - Are there recent funding rounds, acquisitions, or launches in this space?
> - What does search trend data show for the core problem keywords?
> - Are there conferences, communities, or influencers focused on this problem?
>
> **Dimension 5: Differentiation**
> - On what dimension could we be meaningfully different or better?
>   (price, speed, simplicity, integration, audience fit, depth of feature)
> - Is there a segment that is underserved by current solutions?
>
> **Dimension 6: Timing**
> - Is there a reason this is more tractable now than it was 2 years ago?
>   (new technology, regulatory change, behaviour shift, ecosystem gap)
>
> Run these questions and bring back findings. I'll synthesise them.
> Reply: [paste findings] — or "I'll run these and come back"

### C3 — Synthesise findings

When findings are returned:
- Extract key signals per dimension
- Identify the most important insight (the one that most changes or confirms the plan)
- Flag any finding that contradicts an assumption from Lens B
- Output a competitive positioning summary: who are we for, what problem, versus whom

---

## Lens D — Product strategy framing

*Based on Marty Cagan (SVPG) — product discovery and opportunity assessment.*

This lens tests whether this is the right bet before investing in full discovery
and definition. It asks ten structured questions. Some can be answered from
artefacts; others require the user to think carefully.

> **Product opportunity assessment — ten questions:**

Walk through each question. If a discovery or benefit-metric artefact exists,
pre-fill answers where possible and ask for confirmation.

> **1. Exactly what problem will this solve?**
> (Value proposition — be specific about the pain or unmet need, not the solution)
>
> Reply: [describe problem]

> **2. For whom are we solving it?**
> (Target customer — be as specific as possible: role, context, frequency of need)
>
> Reply: [describe customer]

> **3. How will we measure success?**
> (Primary metric — what changes in the world if this works?)
>
> Reply: [describe metric — or "use benefit-metric.md"]

> **4. What alternatives exist today?**
> (How is the customer solving this now, without your product?)
>
> Reply: [describe alternatives]

> **5. Why are we best suited to solve this?**
> (What gives us an unfair advantage — data, distribution, expertise, trust?)
>
> Reply: [describe differentiator]

> **6. Why now?**
> (What's changed that makes this the right moment? Ignore this and you may
> either be too early or already too late.)
>
> Reply: [describe timing signal]

> **7. How will we reach customers?**
> (Go-to-market: existing channel, new channel, partnership, viral mechanic?)
>
> Reply: [describe channel]

> **8. What does the MVP need to do to earn trust?**
> (Not feature completeness — what is the minimum the product must do to prove
> the core value proposition to its first real user?)
>
> Reply: [describe MVP threshold]

> **9. What are the critical risk factors?**
> (Desirability / Viability / Feasibility / Ethical — the top 2–3 things that
> could make this fail even if well executed)
>
> Reply: [list risks]

> **10. Given the above — proceed, redesign, or defer?**
> (This is a human judgment call. I'll present the summary and you decide.)

Present a summary framing:

> **Opportunity assessment summary**
>
> | Question | Signal | Confidence |
> |----------|--------|-----------|
> | Problem | [summary] | Strong / Uncertain / Weak |
> | Customer | [summary] | Strong / Uncertain / Weak |
> | Metric | [summary] | Strong / Uncertain / Weak |
> | Alternatives | [summary] | Strong / Uncertain / Weak |
> | Differentiation | [summary] | Strong / Uncertain / Weak |
> | Timing | [summary] | Strong / Uncertain / Weak |
> | Channel | [summary] | Strong / Uncertain / Weak |
> | MVP threshold | [summary] | Strong / Uncertain / Weak |
> | Risk | [summary] | High / Medium / Low |
>
> **Recommendation:** [PROCEED / REDESIGN / DEFER]
> Rationale: [1–3 sentences]
>
> Do you agree with this read?
> Reply: proceed — or disagree, here's why

---

## Output

Conforms to `.github/templates/ideation.md`.
Save to `.github/artefacts/[feature-slug]/research/ideation.md`.

One file per session. If this is the second ideation session for the same
feature, create `ideation-2.md` and note what changed from the first.

---

## How this feeds the pipeline

| Lens output | Feeds |
|-------------|-------|
| Opportunity map | `/discovery` — as the opportunity framing section; top opportunities become candidate scope |
| Assumption inventory | `/discovery` — assumptions section; 🔴 assumptions become open questions; `/decisions` — RISK-ACCEPTs |
| Market scan synthesis | `/discovery` — competitive context section; `/benefit-metric` — market sizing signals |
| Strategy framing summary | `/discovery` — rationale section; confirms or challenges the proposed MVP scope |

If `/discovery` has not yet been run, the ideation artefact is the input
document for that step. If `/discovery` is already complete, the ideation
artefact can be used to revise scope before proceeding to `/definition`.

---

## What this skill does NOT do

- Does not conduct interviews — generates questions and synthesises answers you bring back
- Does not access the web — generates research prompts you take to external sources
- Does not replace /discovery — it feeds and precedes it
- Does not commit to a scope — all outputs are hypotheses until the formal pipeline validates them
- Does not run experiments — identifies assumptions to test; /spike can run a timeboxed investigation

---

## State update — mandatory final step

> **Mandatory.** Do not close this skill or produce a closing summary without writing these fields. Confirm the write in your closing message: "Pipeline state updated ✅."

Update `.github/pipeline-state.json` in the **project repository** when the ideation artefact is saved:

- Set `ideationPath: ".github/artefacts/[feature-slug]/research/ideation.md"` on the feature object
- If Lens D was run and recommendation is PROCEED: set `ideationSignal: "proceed"`
- If REDESIGN: set `ideationSignal: "redesign"`
- If DEFER: set `ideationSignal: "defer"`
- If only Lens A/B/C were run: set `ideationSignal: "in-progress"`
- Set `updatedAt: [now]` on the feature record
