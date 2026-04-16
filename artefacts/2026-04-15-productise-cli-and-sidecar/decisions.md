# Decision Log: 2026-04-15-productise-cli-and-sidecar

**Feature:** Productise skills-repo — CLI + Sidecar
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Last updated:** 2026-04-15

---

## Decision categories

| Code | Meaning |
|------|---------|
| `SCOPE` | MVP scope added, removed, or deferred |
| `SLICE` | Decomposition and sequencing choices |
| `ARCH` | Architecture or significant technical design (full ADR if complex) |
| `DESIGN` | UX, product, or lightweight technical design choices |
| `ASSUMPTION` | Assumption validated, invalidated, or overridden |
| `RISK-ACCEPT` | Known gap or finding accepted rather than resolved |

---

## Log entries

---
**2026-04-15 | SCOPE | ps2.3 implementation (Docker → subprocess fallback)**
**Decision:** ps2.3 acceptance harness runs the secondary environment as a fresh Node subprocess in an independent tmp directory, not a Docker container. Docker-matrix validation is a post-MVP gate.
**Alternatives considered:** (1) require Docker Desktop to be running before MVP ships; (3) skip ps2.3 entirely.
**Rationale:** Story AC3 allows "Docker container (or equivalent isolated environment)". Docker Desktop was not running on the operator's machine at implementation time; blocking on it contradicts dogfood-first pacing. Subprocess-in-tmpdir catches byte-preservation regressions in the fetch/copy/hash pipeline (EOL normalisation, BOM injection, encoding transforms) — ~80% of real failure modes. What it does NOT catch: cross-OS/libc differences (Alpine vs macOS) and truly distinct process-tree isolation. Those land as a post-MVP Docker-matrix gate.
**Made by:** operator, 2026-04-15.
**Revisit trigger:** MVP ships; post-MVP adds a Docker round-trip job to CI. If any platform-specific byte drift is caught there that the subprocess harness missed, backport the Docker harness to the CLI's `npm test` chain.
---

**2026-04-15 | RISK-ACCEPT | definition-of-ready (W4, all 7 stories)**
**Decision:** W4 (verification script reviewed by domain expert) acknowledged as RISK-ACCEPT for all 7 stories (ps1.1, ps2.1, ps2.2, ps2.3, ps3.1, ps3.2, ps3.3). No separate domain-expert review is performed at MVP.
**Alternatives considered:** Individual scenario walkthroughs with an external reviewer; delay DoR until an external reviewer is identified.
**Rationale:** Per the Q2 dogfood-first decision, the operator is the domain-expert proxy for MVP acceptance. External-adopter validation is the post-MVP gate where independent review is actually added. Delaying DoR on this basis contradicts the dogfood-first decision. Accept the lack of independent review in exchange for shipping; make the post-MVP gate the place where this is repaid.
**Made by:** operator, via `/definition-of-ready`.
**Revisit trigger:** post-MVP external-adopter pass either validates or surfaces issues the operator-as-proxy missed; if material, tighten the DoR W4 requirement or add an external reviewer step for future features.
---

**2026-04-15 | SCOPE | review (Run 1, ps3.1 1-M1)**
**Decision:** `skills-repo artefact <slug> mark-step-done <step>` is an approved MVP addition, not originally listed in discovery MVP items 1–8.
**Alternatives considered:** Fold into `run next --mark-done <step>` as a flag; omit and require operators to hand-edit state files.
**Rationale:** External-only steps (the `implement` step in `story-unit-min`) need a progression mechanism. A flag on `run next` is less discoverable and mixes two responsibilities. Hand-editing state files violates C13 (structural governance preferred over instructional).
**Made by:** operator, via `/decisions`.
**Revisit trigger:** if dogfood shows operators consistently conflate `mark-step-done` with `run next` or the discoverability argument doesn't hold, fold into a flag.
---

**2026-04-15 | SCOPE | review (Run 1, ps3.2 1-M1)**
**Decision:** `skills-repo artefact new <slug>` is an approved MVP addition, not originally listed in discovery MVP items 1–8.
**Alternatives considered:** Fold scaffolding into `init` (creates a default starter feature folder); omit and require manual folder creation.
**Rationale:** Operators need a one-command scaffold so `run next` has a target slug. Folding into `init` conflates "set up the sidecar" with "start a feature" — distinct lifecycle events. Manual folder creation violates C13.
**Made by:** operator, via `/decisions`.
**Revisit trigger:** dogfood shows the `init` + `artefact new` two-step is a friction point.
---

**2026-04-15 | ARCH | review (Run 1, ps1.1 1-M2)**
**Decision:** The new guardrail *"CLI commands never write outside `.skills-repo/` or `artefacts/` except the confirmed `.gitignore` append"* will land in `.github/architecture-guardrails.md` as a new Guardrails Registry entry **as part of the ps1.1 implementation PR**, not as a separate repo-level PR.
**Alternatives considered:** Separate prerequisite PR to land the guardrail first; proceed without a guardrail and rely on story ACs alone.
**Rationale:** Landing the guardrail and the structural check that enforces it in the same PR eliminates the sequencing window. The guardrail is not used by any story other than ps1.1 and its descendants. Proceeding without violates C13.
**Made by:** operator, via `/decisions`.
**Revisit trigger:** ps1.1 DoR H9 (guardrail compliance) cannot pass without the guardrail existing — if that blocks DoR, split into a prerequisite PR.
---

**2026-04-15 | SCOPE | review (Run 1, ps3.3 1-M1)**
**Decision:** M3 (resume-after-pause) is scoped to **≥24 hours at MVP**; the 7-day validation originally suggested in discovery Success Indicator #4 is deferred to a post-MVP gate.
**Alternatives considered:** Keep the 7-day target and use mtime fast-forward inside the 1-day MVP timebox.
**Rationale:** A 7-day target inside a 1-day MVP is aspirational unless faked via mtime manipulation, which tests the mtime code path rather than the real scenario. 24h validates state writes + lockfile reads + checkpoint resume across a day boundary. 7-day / longer is post-MVP.
**Made by:** operator, via `/decisions`.
**Revisit trigger:** post-MVP dogfood re-validates at 7 days and longer; any failure is a real defect.
---

**2026-04-15 | SCOPE | clarify (Q2)**
**Decision:** MVP acceptance target is the skills-repo maintainer dogfooding on a fresh empty test repo — not an external adopter, not `skills-repo-productisation/` itself.
**Alternatives considered:** (B) external-adopter-first as acceptance persona; (C) both sequentially — dogfood-first then adopter pass as named MVP gate.
**Rationale:** Narrow, controlled acceptance surface for a solo operator. External-adopter variance (docs, environments, error paths) is real scope — better handled as a separate post-MVP gate with its own acceptance criteria than folded into MVP.
**Made by:** operator, via `/clarify`.
**Revisit trigger:** MVP ships and external-adopter pass reveals the dogfood-only acceptance missed a structural issue that should have been caught earlier.
---

**2026-04-15 | DESIGN | clarify (Q3)**
**Decision:** CLI requires a git repo; `init` aborts otherwise. The only git-aware mutation is an optional `.gitignore` append for `.skills-repo/state/` and `.skills-repo/cache/`. No `git add`, no `git commit`, no `git init`.
**Alternatives considered:** (A) hands-off entirely — no `.gitignore` help; (C) git-optional with auto-stage of artefacts when git is detected; (D) git-optional with auto-commit after each gate.
**Rationale:** Matches today's skill-authoring norm (operator drives git; skills produce files, operator commits). A non-git host isn't a real MVP persona. Auto-stage/auto-commit widen the failure surface (dirty staging, unwanted commits) with unproven MVP value. The `.gitignore` append is a one-shot `init`-time courtesy that prevents the obvious paper-cut.
**Made by:** operator, via `/clarify` (Claude recommended B; operator confirmed).
**Revisit trigger:** Dogfood or external-adopter signal that operators want flag-gated auto-stage/auto-commit for chain-of-custody reasons.
---

**2026-04-15 | SCOPE | clarify (Q4)**
**Decision:** Cross-machine hash round-trip reproducibility is a **mandatory MVP acceptance test**, not best-effort. On a clean second environment, `init` against the same `lock.json` must reproduce every per-file hash byte-for-byte. Failure = MVP does not ship.
**Alternatives considered:** (A) best-effort with no acceptance test — design aims for stability, no validation; (C) same-machine within-session reproducibility only — cheaper, but doesn't cover the multi-machine auditor scenario.
**Rationale:** Success indicator #10 ("hash round-trip works offline") and the C5 audit claim both depend on reproducibility. Shipping MVP without validating it leaves the governance claim unfounded. The cost is one cross-machine test in DoD, not a body of work.
**Made by:** operator, via `/clarify` (Claude recommended B; operator confirmed).
**Revisit trigger:** Test proves expensive or flaky in practice, requiring a narrower guarantee.
---

**2026-04-15 | SLICE | clarify (Q5)**
**Decision:** productisation MVP treats Phase 3 upstream as "will be inherited later." Build the CLI/sidecar/fetch model against the current Phase-3-definition-era skill set in the `craigfo/skills-repo` fork. Phase 3 improvements (gate structural independence, T3M1 fields, enterprise adapters) merge in as a post-MVP follow-up "refresh lockfile default" task — not blocking MVP, not tracked continuously during MVP.
**Alternatives considered:** (A) hard-isolate — never pull upstream; (B) periodic upstream pulls during MVP — merge/rebase from `heymishy/skills-repo` as Phase 3 stories land; (D) freeze Phase 3 until productisation MVP ships — outside the operator's authority.
**Rationale:** Cheapest honest answer for a solo operator. A risks duplication/divergence; B adds ongoing upstream-tracking cost this operator can't pay; D requires coordination outside scope. C defers the merge cost to a single post-MVP event with known scope.
**Made by:** operator, via `/clarify` (Claude recommended C; operator confirmed).
**Revisit trigger:** A Phase 3 change lands that collides materially with the productisation product model — refresh task is upgraded to a blocker rather than a follow-up.
---

**2026-04-15 | SCOPE | benefit-metric (roadmap alignment)**
**Decision:** This productisation work is labelled the **"Productisation thread"** — an orthogonal body of work, not a numbered phase in `product/roadmap.md`. The roadmap's existing "Phase 4 — Adaptive governance and operational domains" stays as written and retains the Phase 4 label.
**Alternatives considered:** (B) insert our work as Phase 4 in the roadmap and renumber existing Phase 4 → Phase 5; (C) sub-phase naming (4a Productisation / 4b Adaptive governance); (D) label as Phase 3.5; (E) other.
**Rationale:** Our work closes an unmet **Phase 1–2 outcome** (*"at least two squads can consume skills without forking"*) rather than opening a new roadmap phase. Relabelling the roadmap over-claims the scope; this is a distribution-shape fix, not a new strategic direction. "Orthogonal thread" is honest about impact and avoids churning the roadmap doc for every consumers who've read it. The working folder was renamed from `skills-repo-phase-4/` to `skills-repo-productisation/` on 2026-04-15 as a follow-on cleanup after this decision, to remove the misleading phase-4 label everywhere it had leaked.
**Made by:** operator, via `/decisions` (Claude recommended B; operator chose A).
**Revisit trigger:** If the productisation work grows beyond distribution/packaging into something that genuinely opens a new platform capability surface (e.g. new runtime, new agent identity model), reconsider whether the thread should become a numbered phase and renumber the roadmap at that point.
---

**2026-04-15 | ASSUMPTION | clarify (Q1)**
**Decision:** Record assumption A.9 — a lockfile pinning `{source-url, source-ref, per-file-hash}` is sufficient for offline reproducibility across machines, as long as the source preserves history (tagged refs are not rewritten). Default to tagged refs rather than branch refs for pins. See also ADR-001 below for the underlying architectural decision.
**Alternatives considered:** Pinning against branch refs (simpler, but force-push invalidates the chain); pinning against immutable content-addressed tarballs (more robust but requires a registry/mirror).
**Rationale:** Tagged refs are the minimum viable immutability guarantee available from the default source (GitHub). Registry/mirror approach is deferred until demand justifies the infrastructure.
**Made by:** operator, via `/clarify` (new assumption recorded).
**Revisit trigger:** The default source rewrites a tag (force-push a tag ref), or operators consistently pin against branches in practice.
---

## Architecture Decision Records

### ADR-001: Fetch skills and standards at `init` from a configurable source; don't bundle them in the CLI package

**Status:** Accepted
**Date:** 2026-04-15
**Decided by:** operator (via `/clarify` Q1)

#### Context

The 004 strategy document (the primary input to this discovery) assumed skills and standards would ship **inside the installed npm package**. During `/clarify` Q1, the question arose of *how much* of today's library (40 skills, 11 disciplines of standards) the package should bundle — full library, minimal slice, or full-but-exposing-minimal-preset.

Bundling surfaces three problems:

- **Scope churn.** Every new skill or standards update requires a CLI package release. Velocity couples to packaging cadence.
- **Preset lock-in.** The package decides which skills are available; customising the shipped set means forking the package itself.
- **Update channel (constraint C1).** "Consumers must receive skill updates without forking" — a bundled package arguably satisfies this via `upgrade`, but the coupling to the CLI's release cadence weakens the claim.

A fourth option emerged in conversation: let `init` **fetch** skills and standards from a configurable source URL, with per-file hashes pinned in `lock.json`.

#### Options considered

| Option | Pros | Cons |
|--------|------|------|
| **A. Bundle full library in CLI package** (the 004 default) | Simple mental model; offline install; auditor sees the whole set | Ties skill velocity to CLI release; customising requires forking the package; large install payload |
| **B. Bundle minimal slice only** | Smaller package; clearer MVP scope; "expand later" | Constrains what operators can try without a CLI upgrade; awkward for auditors who need to see unused skills for comparison |
| **C. Bundle full but expose minimal preset** | Audit coverage retained; small preset = small workflow | Still couples velocity; still payload cost; doesn't satisfy "customise without forking" |
| **D (chosen). Fetch from configurable source at `init`** | Decouples skills from CLI version; customise via `--source=<url>` without forking; audit via resolved snapshots in `.skills-repo/skills/`; C1 mechanically satisfied (pull model) | Requires network at `init` and `upgrade`; depends on source preserving history (tagged refs); new failure surface (fetch errors, cert issues, rate limits) |

#### Decision

**D — Fetch skills and standards at `init` from a configurable source URL.**

The CLI package ships **engine + CLI + `workflow.yaml` schema + preset definitions**, nothing else. At `init`, the CLI fetches the selected preset's skills/standards from a source (default: `craigfo/skills-repo` at a tagged release), writes byte-identical snapshots to `.skills-repo/skills/` and `.skills-repo/standards/`, and pins `{engine-version, source-url, source-ref, per-file-hash}` in `.skills-repo/lock.json`. All subsequent commands (`run`, `verify`, `status`, `artefact new`) operate offline from the snapshots + lockfile.

Primary reason: cleanly separates skill-content velocity from CLI-release velocity, which directly serves C1 (update channel must never be severed) without forcing a package upgrade for every skill change.

#### Consequences

**Easier:**
- Customising the skill-set without forking the CLI (point `--source` at an internal mirror or a private fork).
- Releasing a skill-only change without a CLI release.
- Auditors see the exact skills that governed a feature in `.skills-repo/skills/` snapshots, independent of CLI version.

**Harder / more constrained:**
- `init` and `upgrade` require network; added to constraints as P4.8 (only those two commands may touch the network).
- Lockfile must pin against immutable refs (tags or commits, not branches) — A.9 records this assumption and the force-push risk.
- MVP must include a cross-machine hash round-trip acceptance test (see Log entry for Q4) to validate that the fetch pipeline preserves bytes.
- Fetch-failure UX is now a real concern: `init` needs clear errors for unreachable source, rate limits, or cert problems.

**Off the table:**
- "The CLI and the skills version in lockstep" — they can now drift deliberately.
- Pure-offline `init` — network-free install is deferred to a post-MVP mirror/tarball mode.

#### Revisit trigger

- Fetch reliability proves unacceptably poor in practice (rate limits, outages, cert chain issues on operator machines).
- The default source (`craigfo/skills-repo`) starts rewriting tags, invalidating pins.
- Demand emerges for a fully-offline / air-gapped install flow that the fetch model can't satisfy even with a mirror.
- The skill library stops changing at a rate that justifies decoupling from CLI releases.
