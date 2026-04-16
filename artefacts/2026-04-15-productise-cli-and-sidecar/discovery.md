# Discovery: Productise skills-repo — CLI + Sidecar

**Status:** Approved
**Created:** 2026-04-15
**Approved by:** Operator, 2026-04-15
**Author:** Claude (operator-driven)
**Feature slug:** 2026-04-15-productise-cli-and-sidecar
**Primary reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/reference/004-skills-repo-as-product-strategy.md`
**Supporting references:** `reference/001-skills-repo-intro.md`

---

## Problem Statement

To adopt skills-repo today, a team must clone the repository and live inside its folder structure (`.github/`, `workspace/`, `standards/`, `artefacts/`, `src/`). This blocks adoption on any project that already owns those folders or its own conventions.

The block is not theoretical: across two real projects, neither could adopt skills-repo cleanly.

The platform's own README names *"a distribution model enabling consumption without forking"* as an explicit goal. The current distribution model requires forking or cloning to consume. The constraint is real: `constraints.md` C1 states "the update channel must never be severed" — the current clone model either severs it (once a fork diverges, upstream skills don't flow in) or degrades to manual merges.

**Cost when unresolved:** Potential adopters either fork (and lose upstream sync), build parallel governance by hand, or skip adoption entirely. skills-repo accumulates no installed base beyond its own dogfood repo; the improvement signal needed for `/improve` to scale across consumers never materialises.

---

## Who It Affects

### Primary: Operator on an in-flight project
A developer or squad lead trying to adopt structured governance on a repo that already owns its own `.github/`, memory system, `CLAUDE.md`, and conventions. Hits the problem at the point of first install: `.github/skills/`, `workspace/`, `standards/` would collide with or overwrite existing files.

### Primary: Greenfield-project operator
An operator starting a new project who wants skills-repo governance baked in from day zero without cloning the whole platform repo as their project skeleton. Wants a one-command `new`, not a template to carve.

### Primary: Auditor / risk reviewer
A reviewer trying to re-materialise the exact skill and standards bodies that governed a past decision, offline, at pinned versions, from trace hashes alone. Hits friction when skills and standards are spread across a host repo (where versions drift per repo) rather than pinned via a lockfile to a packaged library.

### Primary: skills-repo maintainer
The platform team trying to ship skill and standards updates to consumers who have cloned the repo. Every consumer is effectively a fork; upstream changes require manual sync — the exact failure mode C1 prohibits.

### Secondary: Evaluator / new adopter
A practitioner trying to trial skills-repo without committing a whole repo's folder layout to it. Hits friction when `init`-equivalent means cloning and re-homing files, not a one-command install and throwaway uninstall.

---

## Why Now

1. **Accumulated evidence that clone-to-adopt fails in practice.** Three real projects surveyed, three distinct adoption frictions, zero cleanly adopted. The common blocker in every case is the distribution model.
2. **A stated platform goal is provably unmet.** The README declares "consumption without forking" — yet the current model *requires* cloning. With 001–004 as written evidence, the gap is no longer theoretical.
3. **Phase 3 is already moving in this direction.** Phase 3 story p3.3 (gate structural independence) separates the assurance gate from the delivery repo — the same architectural direction 004 takes further, re-homing skills/standards/templates into a versioned package with lockfile pinning. The two efforts are architecturally adjacent; resolving them together is cheaper than in sequence.
4. **Before onboarding more teams at scale.** Phase 3 also builds enterprise adapters (Bitbucket DC, Jira, Confluence, Teams) aimed at multi-squad adoption. Fixing the distribution shape *before* wider rollout avoids every new consumer becoming a fork with manual sync debt.
5. **Hash/audit chain hardening (Phase 3 T3M1) works better with a packaged library.** Five of the eight T3M1 audit gaps (`standardsInjected` hashes, tamper-evidence registry, `traceHash` anchored outside the delivery repo) are more naturally solved when skills/standards live in a pinned, versioned package than when they are vendored into each host repo.

---

## MVP Scope

The smallest validating slice is an installable package with a CLI that lets one operator, on a fresh empty repo, run `init` → `run next` → produce one complete artefact chain end-to-end, with the host repo containing only `.skills-repo/` and `artefacts/`.

**Ships in MVP:**

1. **CLI package on npm.** Published as `skills-repo` (or `npx skills-repo`). The published package carries the **engine + CLI + `workflow.yaml` schema + preset definitions**, but **not** the skill/standards library content itself — those are fetched at `init` time from a configurable source (see item 6).
2. **`init`** — interactive or flag-driven. Requires a git repo; aborts with a clear error if the host directory is not under git. Writes `.skills-repo/workflow.yaml`, `.skills-repo/profile.yaml`, `.skills-repo/lock.json`, and an empty `artefacts/`. Offers (does not force) to append `.skills-repo/state/` and `.skills-repo/cache/` to `.gitignore` — the only git-aware mutation the CLI performs. **The CLI never runs `git add`, `git commit`, or any other git mutation on artefacts or state**; operator manages staging and commits themselves, matching today's skill-authoring norm. Non-destructive: never touches files outside `.skills-repo/` and `artefacts/` (except the optional one-line `.gitignore` append).
3. **`workflow.yaml` schema + a small set of built-in presets.** Preset definitions (e.g. `story-unit-min`, `story-unit-full`, `research-experiment`) ship with the engine package and declare which skills + standards each expects. Each preset maps a chain of steps to skill identifiers; at `init`, the operator selects a preset interactively or via `--preset=<name>`. Custom / hand-edited `workflow.yaml` is allowed; full composition validation deferred (see Out of Scope #10).
4. **`run next`** — reads state, picks the next step whose prerequisites are met, loads the resolved SKILL.md body from `.skills-repo/skills/`, drives the interaction, writes the artefact to `artefacts/<slug>/`.
5. **`status`** — reports where the operator is and what is blocked.
6. **Skills + standards fetched at `init` from a configurable source.** The CLI fetches the selected preset's skills and standards from a source URL recorded in `profile.yaml`. **Default source:** the productisation working fork (`craigfo/skills-repo` at a tagged release). Fetch resolves per-file content hashes and writes byte-identical snapshots to `.skills-repo/skills/` and `.skills-repo/standards/`. Alternative sources selectable via `--source=<url> --ref=<tag-or-commit>`. Subsequent `run`, `verify`, `status`, and `artefact new` operate fully offline from the snapshots + lockfile. Only `init` and `upgrade` need network.
7. **`lock.json`** — pins `{ engine-version, source-url, source-ref, per-skill-hash, per-standards-hash }`. `run` verifies resolved content matches the lock before executing.
8. **Local-only at run-time.** No CI, no GitHub Actions required. `init`/`upgrade` may use the network; all other commands must not.

**First user (MVP acceptance target): the skills-repo maintainer (operator), dogfooding on a fresh empty test repo** — not on `skills-repo-productisation/` itself, and not an external adopter. External-adopter validation is a separate pass, out of scope for MVP (tracked as a post-MVP gate).

**First-user usefulness tests:**

- `init` through first artefact takes under ~15 minutes on a clean repo.
- Host repo contains exactly two paths (`.skills-repo/` and `artefacts/`) after a full cycle.
- Re-running `run next` a week later resumes from the last checkpoint without re-priming.
- An auditor opening the repo can read resolved SKILL.md bodies in `.skills-repo/skills/` at the pinned version.
- **Cross-machine hash round-trip validated.** Acceptance test: on a clean second environment, run `init` against the same `lock.json` (source-url + source-ref), and every per-file hash in the newly resolved `.skills-repo/skills/` + `.skills-repo/standards/` matches the lockfile byte-for-byte. Failure = MVP does not ship.

**Nice-to-have (post-MVP):** configurable CLI + sidecar name (e.g. `myco-skills-repo` with `.myco-skills-repo/`) for white-labelling, forked distributions, or running multiple skill-repos side-by-side in one host. Not required to validate MVP; flagged now so the packaging design doesn't hard-code `skills-repo` / `.skills-repo/`.

---

## Out of Scope

1. **`adopt` flow with audit + reverse-fit refusal** (004 §8). Non-destructive graft onto existing repos is important but second-phase — MVP validates shape, `adopt` validates fit.
2. **`new` greenfield scaffolder.** Depends on MVP presets being stable first.
3. **`verify` (local) and `verify --ci` parity.** CI equivalents and the assurance-gate workflow defer.
4. **`upgrade` with version pinning and rollback.** Requires a published release cadence.
5. **Custom-skill overrides in `.skills-repo/skills/`.** MVP reads only from the packaged library. Override plumbing (precedence rules, hash handling, lockfile diff) is real surface area.
6. **Multi-surface adapters beyond `git-native`.** `iac`, `saas-api`, `saas-gui`, `m365-admin`, `manual` all defer.
7. **Memory adapter plurality.** MVP ships one default (`json-state`); SQLite / `handover.md` / external-api adapters defer.
8. **Commercial surface.** No licensing tiers, no editions, no telemetry, no audit packs, no pricing. Free and open in MVP.
9. **`pipx` and static-binary distribution channels.** npm only at MVP.
10. **`workflow validate` refusal of invalid sequences.** MVP allows hand-written `workflow.yaml` but does not yet enforce skill-author prerequisites; composition constraints come later. Risk R.6 applies.
11. **Evidence-reproducibility guarantees across versions.** MVP pins in `lock.json` but does not guarantee re-materialisation of old skill bodies after a library-breaking change.
12. **Migration / translation tooling.** No converter from existing cloned skills-repo layouts into the new sidecar shape.
13. **Fleet / cross-repo aggregation.** Single-project tool only.
14. **Pipeline-state-as-service / Jira/Linear integration.** Not a project-management tool (per mission §What the platform is not).
15. **Forcing the existing skills-repo's own layout to migrate.** The current repo continues to work for dogfooding; MVP does not require skills-repo maintainers to move their own workflow to the new shape.
16. **External-adopter acceptance pass.** MVP validates on the maintainer's dogfood target only. A separate pass — targeting a real external adopter — is tracked as a post-MVP gate before any broader rollout.
17. **Non-git hosts.** The CLI requires a git repo. Running `init` outside a git repo is a clear error; no `git init` is performed on the operator's behalf.
18. **Auto-stage and auto-commit of artefacts.** The CLI never runs `git add` or `git commit`. Whether these become flag-gated opt-ins later is post-MVP, driven by real usage signal.

---

## Assumptions and Risks

### Assumptions

- **A.1** Operators prefer a sidecar over an in-tree layout. Extrapolated from three project analyses; not validated with real platform users.
- **A.2** Today's SKILL.md files load cleanly from a package. Some referenced paths inside skill bodies are repo-relative and need auditing.
- **A.3** Hash reproducibility survives the fetch pipeline (no EOL normalisation, no BOM stripping) so `lock.json` hashes stay stable across install machines. **Validated at MVP via the cross-machine round-trip acceptance test** — see First-user usefulness tests. If validation fails, the fetch/snapshot implementation must be fixed before MVP ships.
- **A.4** `workflow.yaml` schema can express today's implicit sequencing (frontmatter prerequisites, phase boundaries in prose). May need schema iterations.
- **A.5** The current repo can be split into package-source vs. dogfood in parallel with Phase 3's 18 in-flight stories, not serialised behind them.
- **A.6** npm is an acceptable first distribution channel across platform-team users (including non-JS-primary).
- **A.7** Auditors accept resolved snapshots + lockfile as evidence equivalent to today's in-tree layout. Not tested with a real auditor.
- **A.8** A guided `init` completing in ~15 minutes is achievable and good enough for first adoption.
- **A.9** A lockfile pinning `{source-url, source-ref, per-file-hash}` is sufficient for offline reproducibility across machines, as long as the source preserves history (tagged refs are not rewritten). Risk: a force-push on the source repo invalidates the chain. Mitigation: default to tagged refs, not branch refs, for pins.

### Risks

- **R.1** Operator rejection of the sidecar model — preference for a cloneable template they can modify in place.
- **R.2** Skill-authoring becomes harder when authors can't assume repo-local files exist.
- **R.3** Hash chain breakage when a package bump touches SKILL.md bodies; managing this in lockstep with the improvement loop (C4, C5) is subtle.
- **R.4** Dogfood divergence: the skills-repo team's own usage drifts from what consumers experience.
- **R.5** MVP too small to produce useful adoption-friction data. Counter: ship inside this team first, validate loop before external.
- **R.6** `workflow.yaml` composition without validation invites misuse — sequences that skip skill-author prerequisites silently weaken governance (against C5/C13). Counter: loud documentation now; prioritise `validate` next.
- **R.7** Regulated consumers pin conservatively; fast-moving package velocity could push them back to the cloned-fork model regardless.
- **R.8** Rename feature (nice-to-have) complicates hash/audit chain if the rename mechanism leaks into skill identity.

---

## Directional Success Indicators

1. **Clean host repo after a full cycle.** Adopting project's `git status` shows changes only in `.skills-repo/` and `artefacts/`.
2. **Time-to-first-artefact under ~15 minutes** on a clean repo.
3. **Zero clones required to consume.** Onboarding docs contain no `git clone heymishy/skills-repo`. The README goal is demonstrably satisfied.
4. **Resume-after-a-week works.** Operator pauses mid-flow, returns a week later, `run next` picks up from the last checkpoint without re-priming.
5. **Auditor self-service.** An auditor reads `.skills-repo/skills/<skill>/SKILL.md` at the pinned version and can answer MODEL-RISK questions without engineering assistance.
6. **Skills-repo team's own productisation-thread-and-later delivery runs on the packaged shape.** No degradation vs. Phase 2 actuals (~0.08–0.17h/story).
7. **`adopt` dry-run on surveyed external adopters succeeds non-destructively** — a manual equivalent produces a clean `.skills-repo/` + `artefacts/` with no existing file overwritten.
8. **Greenfield `new` produces a disciplined starter repo** recognisable as equivalent to a carefully hand-built governance posture — without the months of build-up.
9. **Upstream sync is one command.** `upgrade` delivers new skills + standards without manual merge — C1 mechanically satisfied, not just documented.
10. **Hash round-trip works offline.** Any past trace entry: resolve the SKILL.md body offline from `lock.json`, compute the hash, matches the trace. No network.
11. **No production incidents traced to the three §12 tensions** (skill invisibility, workflow skipping a required skill, unrecoverable hash mismatch after upgrade).

---

## Constraints

### Inherited (product-level, non-negotiable — from `product/constraints.md`)

- **C1** Update channel must never be severed. The productisation thread is the implementation of this; no MVP choice may re-introduce a fork requirement.
- **C2** POLICY.md floors non-negotiable. Standards tiering must survive the package move.
- **C3** Spec immutability — improvement loop cannot redefine success.
- **C4** Human approval gate non-negotiable for instruction-set changes. Package releases still require human-approved PRs upstream.
- **C5** Versioned, hash-verified instruction sets. Re-homed into `lock.json` + per-skill hashes; hash chain must not weaken.
- **C7** One question at a time in skill interactions. Holds in CLI interactive mode.
- **C11** No persistent agent runtime dependency. CLI runs on standard developer tooling.
- **C13** Structural governance preferred over instructional. Package/CLI must enforce properties structurally where possible (e.g. lockfile hash check before skill load).
- **C15** SKILL.md instructions outcome-oriented. Package move must not leak packaging details into SKILL.md bodies.

### Productisation-thread-specific

- **P4.1** productisation MVP treats Phase 3 upstream as "will be inherited later." MVP builds the CLI/sidecar/fetch model against the current Phase 3-definition-era skill set in the fork. Phase 3 improvements (gate structural independence, T3M1 fields, enterprise adapters) merge in *after* MVP ships as a follow-up "refresh lockfile default" task — not blocking MVP, not tracked continuously during MVP. No periodic upstream pulls during MVP development; no divergence-reconciliation cost in MVP scope. If Phase 3 lands a change that conflicts with the productisation product model, that conflict is resolved at refresh time, not pre-emptively.
- **P4.2** Solo operator (operator + agent) on a single machine. No team to parallelise across.
- **P4.3** npm as first publish channel. Pipx and static binary defer.
- **P4.4** GitHub distribution origin is `craigfo/skills-repo` (the productisation working fork). Upstream to `heymishy/skills-repo` is a separate integration question, not resolved here.
- **P4.5** Windows / macOS / Linux parity. No OS-specific install path.
- **P4.6** No cloud dependency in install, init, run, verify, or upgrade.
- **P4.7** Skill bodies stay as `.md` and byte-identical through the fetch pipeline — prerequisite for A.3 and for operator/auditor readability.
- **P4.8** `init` and `upgrade` may use the network; `run`, `verify`, `status`, `artefact new` must not. Install-time fetch is consistent with package-manager norms (npm fetches on install, runs offline thereafter). The 004 §10 "no cloud dependency" non-goal applies to ongoing operation, not the one-time install/update path.

---

**Next step:** Human review and approval → `/benefit-metric`

---

## Clarification log

2026-04-15 Clarified via `/clarify`:

- **Q1: What exactly ships in the packaged skill library at MVP?**
  A: Neither a bundled full-library nor a bundled minimal-slice. The CLI package ships engine + schema + preset definitions only; skills and standards are **fetched at `init`** from a configurable source (default: `craigfo/skills-repo` at a tagged release), with per-file hashes pinned in `lock.json`. Changes applied: MVP Scope items 1, 3, 6, 7, 8 rewritten; new A.9 (lockfile pin with tagged refs); new P4.8 (network permitted only for `init` / `upgrade`).
- **Q2: Who runs `init` first?**
  A: **A — Dogfood-first.** MVP acceptance target is the maintainer running `init` on a fresh empty test repo (not `skills-repo-productisation/` itself). External-adopter validation is a separate post-MVP gate. Changes: "First user" subsection added to MVP Scope; Out of Scope #16 added.
- **Q3: What does the CLI assume/do about git?**
  A: **B — Git-required, gitignore-only.** `init` aborts if not a git repo; the only git-aware mutation is the optional `.gitignore` append for `.skills-repo/state/` + `.skills-repo/cache/`. No `git add`, no `git commit`. Changes: MVP Scope item 2 rewritten; Out of Scope #17 (non-git hosts) and #18 (auto-stage/auto-commit) added.
- **Q4: Hash reproducibility — provable at MVP or best-effort?**
  A: **B — Provable at MVP.** Cross-machine round-trip acceptance test in DoD: on a clean second environment, `init` against the same `lock.json` must reproduce every per-file hash byte-for-byte. Failure = MVP does not ship. Changes: new bullet added to First-user usefulness tests; A.3 updated to mark validation mandatory at MVP.
- **Q5: How does productisation MVP sequence against Phase 3 in-flight?**
  A: **C — Phase 3 is "inherited later."** productisation MVP builds against the current Phase 3-definition-era skill set in the fork; Phase 3 improvements merge in as a follow-up "refresh lockfile default" task after MVP ships. No periodic upstream pulls during MVP. Changes: P4.1 rewritten.
