# Benefit Metric: Productise skills-repo — CLI + Sidecar

**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Date defined:** 2026-04-15
**Metric owner:** Operator (skills-repo maintainer)

---

## Tier Classification

**⚠️ META-BENEFIT FLAG:** Yes
<!-- productisation MVP is dogfood-first (Q2): it delivers user value (clean install path, usable CLI) and simultaneously tests the platform hypothesis that the CLI + .skills-repo/ sidecar + fetch-from-source shape is viable in practice. Meta-learning is the primary test at MVP; product metrics validate shape-has-landed; external-adopter validation is a post-MVP gate. -->

---

## Tier 1: Product Metrics (User Value)

### Metric M1: Sidecar-only footprint

| Field | Value |
|-------|-------|
| **What we measure** | Paths under the host repo's working tree modified by skills-repo commands during a full MVP cycle. Measured as `git status --porcelain` output scoped to changes attributable to the CLI. |
| **Baseline** | N/A — no CLI exists yet; baseline is established at first run. Prior clone-model baseline: skills-repo adoption touches `.github/`, `workspace/`, `standards/`, `artefacts/`, `src/`, `contexts/` (6+ top-level paths). |
| **Target** | Exactly two top-level paths touched: `.skills-repo/` and `artefacts/`. Optional one-line append to `.gitignore` counts as a single opt-in, operator-confirmed mutation. |
| **Minimum validation signal** | At most three top-level paths touched (counting the optional `.gitignore` append). Anything beyond this = shape violation = MVP does not ship. |
| **Measurement method** | Automated check in the DoD acceptance test: after `init` → `run next` through one full preset cycle on a clean test repo, `git status --porcelain` output is inspected for any path outside `.skills-repo/`, `artefacts/`, or `.gitignore`. |
| **Feedback loop** | Violation → block MVP ship; operator investigates which command wrote where; fix before release. |

### Metric M2: Time-to-first-artefact

| Field | Value |
|-------|-------|
| **What we measure** | Wall-clock time from `npm i -g skills-repo` (or equivalent install) on a fresh clean repo to the first committed artefact in `artefacts/<slug>/`. |
| **Baseline** | N/A — no CLI exists yet. Qualitative baseline: today's clone-model onboarding is operator-estimated at several hours for an unfamiliar user (no formal measurement). |
| **Target** | Under 15 minutes on the dogfood operator's machine, from clean state to first artefact. |
| **Minimum validation signal** | Under 30 minutes. Anything slower = UX shape has a problem worth blocking on. |
| **Measurement method** | Operator runs the acceptance test once in a fresh empty git repo, times with wall clock. Recorded in the DoD artefact. |
| **Feedback loop** | Over 30 min → identify which step dominated (install, `init` interactive, first skill run) and fix before ship. Between 15–30 min → ship with a noted gap and track in learnings. |

### Metric M3: Resume-after-pause works

| Field | Value |
|-------|-------|
| **What we measure** | Whether `skills-repo status` + `skills-repo run next`, executed more than ~7 calendar days after the prior session, resumes from the last state checkpoint without re-priming (no re-reading of prior skill outputs, no re-asking of already-answered questions). |
| **Baseline** | N/A — no CLI exists. Today's skills-repo: operator re-primes context verbally at each new session; `workspace/state.json` exists but no CLI reads it autonomously. |
| **Target** | Pass — a paused cycle resumes cleanly; next-skill selection and prior-answer availability are both correct. |
| **Minimum validation signal** | Same as target (binary). A partial pass (e.g. state read succeeds but next-skill selection wrong) = fail. |
| **Measurement method** | Acceptance test: run `init` → complete one skill → close shell → wait **at least 24 hours at MVP** (or simulate via state-file timestamp fake) → reopen, run `status`, run `run next`. Confirm the expected next skill loads and prior answers are visible. Recorded in DoD. **Note:** the 7-day resume window originally targeted in discovery Success Indicator #4 is deferred to a post-MVP validation gate; the 24h window is the MVP acceptance threshold, tracked in decisions.md. |
| **Feedback loop** | Fail → block ship; root-cause (state schema? file locations? lockfile drift?). |

### Metric M4: Auditor self-service on resolved snapshots

| Field | Value |
|-------|-------|
| **What we measure** | Whether a reviewer unfamiliar with the feature can, without engineering assistance, open `.skills-repo/skills/<skill>/SKILL.md` and `.skills-repo/standards/<discipline>/core.md` at the pinned version and read the rules that governed a produced artefact. |
| **Baseline** | Today's in-tree layout already passes this check (auditors open `.github/skills/`). MVP must not regress it. |
| **Target** | Pass — resolved snapshots are present, byte-identical to the fetched source, readable as markdown without any CLI or tooling. |
| **Minimum validation signal** | Same as target (binary). |
| **Measurement method** | Acceptance test: after a full MVP cycle, the operator (acting as auditor proxy) opens one skill and one standard from `.skills-repo/` without the CLI running; confirms readability and version note matches `lock.json`. Recorded in DoD. |
| **Feedback loop** | Fail → inspect whether snapshot write, encoding, or permission rule broke the chain; fix before ship. |

### Metric M5: Cross-machine hash round-trip

| Field | Value |
|-------|-------|
| **What we measure** | On a clean second environment, running `init` against the same `lock.json` (`source-url` + `source-ref`) produces per-file hashes byte-for-byte identical to the lockfile entries. |
| **Baseline** | N/A — no CLI exists. The underlying C5 hash-verification claim is currently asserted but not end-to-end reproducible offline. |
| **Target** | 100% hash match across all fetched skills and standards on at least two machines (operator's primary + a separate clean environment — VM, second laptop, CI runner, or container). |
| **Minimum validation signal** | 100% match on the primary machine and at least one separate environment. Any mismatch on any file = MVP does not ship (per Q4 decision). |
| **Measurement method** | Scripted acceptance test invoked in DoD. Primary machine: `init` at ref X, capture hashes. Second environment: same command, same ref, compare hash-by-hash. Diff any drift. |
| **Feedback loop** | Mismatch → investigate fetch pipeline (EOL normalisation, BOM, encoding, cert chain). Fix before ship. Success = A.3 assumption validated and retirable. |

---

## Tier 2: Meta Metrics (Learning / Validation)

### Meta Metric MM1: Dogfood delivery ran on the packaged CLI

| Field | Value |
|-------|-------|
| **Hypothesis** | The packaged CLI + sidecar shape is good enough for the skills-repo maintainer's own delivery loop — not just a theoretical product for external users. |
| **What we measure** | Whether, by the end of productisation MVP, the maintainer has produced at least one full artefact chain (discovery → DoD or equivalent short-loop) using the installed CLI against a dogfood test repo. Counted as: successful invocations of `init` + `run next` + produced artefacts traceable to the CLI, not hand-written. |
| **Baseline** | 0 — currently no CLI exists; all skills-repo delivery uses the clone-model in-tree layout. |
| **Target** | At least one full artefact chain delivered via the CLI on a dogfood test repo before MVP ships. |
| **Minimum signal** | At least one `run next` execution produces an artefact through the CLI (even if the full chain is partial, the engine-path is validated). |
| **Measurement method** | Operator records in the DoD artefact the test-repo path and the sequence of CLI invocations; traces written to `.skills-repo/traces/` on the test repo are the evidence. |

### Meta Metric MM2: No §12-tension incidents during MVP

| Field | Value |
|-------|-------|
| **Hypothesis** | The three tensions called out in 004 §12 — (1) skill visibility/auditability, (2) workflow.yaml composition without validation, (3) evidence reproducibility across versions — can be mitigated by MVP design choices (snapshots, loud docs, lockfile) without full `workflow validate` or upgrade tooling. |
| **What we measure** | Count of incidents during MVP development + dogfood run that trace to one of the three §12 tensions. An "incident" = a case where the mitigation failed and produced wrong/missing evidence or silently weakened governance. |
| **Baseline** | 0 expected; the mitigations are in scope. |
| **Target** | Zero incidents before MVP ships. |
| **Minimum signal** | At most one incident, with a documented workaround landed before ship. |
| **Measurement method** | Tracked informally during development in a short `workspace/productisation-incidents.md` file (one line per incident) + reviewed at MVP close. |

### Meta Metric MM3: Fetch-and-pin model held

| Field | Value |
|-------|-------|
| **Hypothesis** | Pinning `{source-url, source-ref, per-file-hash}` in `lock.json` against tagged refs is sufficient for offline reproducibility, given the default source (`craigfo/skills-repo`) does not rewrite tags. (A.9) |
| **What we measure** | Count of fetch-related failures during MVP development and dogfood: rewritten/moved tags, force-pushed refs, fetch-timeout or transport failures, hash drift. |
| **Baseline** | 0 expected — tag refs under operator's own control on `craigfo/skills-repo`. |
| **Target** | Zero fetch-related failures across all MVP `init` runs. |
| **Minimum signal** | At most one transient transport failure (e.g. network blip) with a clean retry. Any ref rewrite or hash drift = minimum not met; A.9 invalidated; design revisit required. |
| **Measurement method** | Recorded in the same `workspace/productisation-incidents.md` file used for MM2. MM5 also serves as the structural acceptance test. |

---

## Metric Coverage Matrix

<!--
  Populated by the /definition skill after stories are created. Every metric must
  have at least one contributing story. Every story must reference at least one
  metric. Gaps are pipeline failures.
-->

| Metric | Tier | Contributing stories |
|--------|------|-----|
| M1 — Sidecar-only footprint | 1 | ps1.1, ps3.3 |
| M2 — Time-to-first-artefact | 1 | ps3.1, ps3.3 |
| M3 — Resume-after-pause | 1 | ps3.1, ps3.2, ps3.3 |
| M4 — Auditor self-service | 1 | ps2.1, ps2.2 |
| M5 — Cross-machine hash round-trip | 1 | ps2.2, ps2.3, ps3.3 |
| MM1 — Dogfood delivery on packaged CLI | 2 | ps1.1, ps3.3 |
| MM2 — No §12-tension incidents | 2 | ps3.3 |
| MM3 — Fetch-and-pin model held | 2 | ps2.1, ps2.3, ps3.3 |

---

## Deferred indicators — post-MVP gates

These directional indicators from discovery §Directional Success Indicators are **explicitly out of MVP scope** because the underlying feature surface is out of scope. Recorded here so they are not lost; tracked as post-MVP acceptance gates.

| Indicator | Depends on OOS feature | Gate for |
|---|---|---|
| #3 Zero clones required in onboarding | Docs + `adopt` | post-MVP rollout |
| #7 `adopt` dry-run succeeds non-destructively | `adopt` command | post-MVP 1 (adopt) |
| #8 Greenfield `new` produces disciplined starter | `new` command | post-MVP 2 (new) |
| #9 Upstream sync one command | `upgrade` command | post-MVP 3 (upgrade) |
