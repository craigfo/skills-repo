# 004 — skills-repo as a Product (CLI + Sidecar)

**Date:** 2026-04-15
**Scope:** A single-phase strategy for turning skills-repo from a template-you-clone into a **product** — an installable package and CLI that lives in a small sidecar folder inside any host project. No pricing, no tiers, no phased roadmap. One shape, one phase.
**Inputs:** 001 (skills-repo intro), prior analyses of surveyed external projects (retained privately).

---

## 1. Thesis

Today you *clone* skills-repo and your project's governance lives inside its folder layout (`.github/`, `workspace/`, `standards/`, `artefacts/`, `src/`, …). That is why it doesn't graft onto other projects — each already owns those folders and its own conventions.

The product form is simple: **you install skills-repo, it drops a `.skills-repo/` sidecar in your project, it writes artefacts into one `artefacts/` folder, and it otherwise stays out of your way.** Usage is a CLI. Configuration is one YAML. Your repo stays clean.

```
$ skills-repo init
$ skills-repo run next
$ skills-repo status
$ skills-repo verify
```

---

## 2. HostProjectExample in the host repo

Exactly two folders. Nothing else is added to the host project.

```
<host-project>/
├── .skills-repo/            # the sidecar; owned by the tool
│   ├── workflow.yaml        # ← the one file the operator edits
│   ├── profile.yaml         # unit of work, memory adapter, CI posture
│   ├── skills/              # resolved skill set (from package + local overrides)
│   ├── standards/           # resolved standards snapshot
│   ├── state/               # pipeline state, session checkpoints (gitignored default)
│   ├── traces/              # audit records (committed)
│   ├── cache/               # template/hash cache (gitignored)
│   └── lock.json            # pinned engine + skill/standard hashes
├── artefacts/               # the one output folder; committed
│   └── <slug>/
│       ├── discovery.md
│       ├── story.md
│       ├── dor.md
│       ├── dod.md
│       └── …
└── (your actual project — untouched)
```

The engine, skill library, standards library, templates, and validators ship **inside the installed package**, not in the host repo. Host repo pins versions via `.skills-repo/lock.json`.

The operator edits:
- `.skills-repo/workflow.yaml`
- `.skills-repo/profile.yaml`
- artefacts in `artefacts/` (through skills; direct edits allowed)
- their own project code

Nothing else. `.skills-repo/skills/` and `.skills-repo/standards/` may carry project-specific overrides, versioned alongside the host repo — but the library itself is not vendored.

---

## 3. `workflow.yaml` — the one configuration file

Declares the document types the operator uses and the order they run in. The engine loads matching skills from the installed library.

```yaml
version: 1
unit: story
memory:
  adapter: json-state

workflow:
  - step: discovery
    produces: discovery.md
    skill: discovery
    optional: true

  - step: definition
    produces: [epic.md, story.md]
    skill: definition

  - step: test-plan
    produces: test-plan.md
    skill: test-plan
    requires: [definition]

  - step: dor
    produces: dor.md
    skill: definition-of-ready
    requires: [test-plan]
    gate: scope-contract-signoff

  - step: implement
    external: true
    requires: [dor]

  - step: dod
    produces: dod.md
    skill: definition-of-done
    requires: [implement]
    gate: local-assurance
```

### Schema, briefly
- `unit` — `experiment | tier-batch | story | runbook`. Selects which skills are valid.
- `memory.adapter` — `markdown-handover | sqlite | json-state | external-api`. Plug-in contract; the tool does not assume it owns memory.
- Each step: `produces` (path under `artefacts/<slug>/`), `skill` (library name), optional `requires`, optional `gate`, optional `optional: true`, optional `external: true` (no artefact; progression check only).
- Reserved gates: `operator-approval`, `scope-contract-signoff`, `local-assurance`, `ci-assurance`, `learnings-capture`, `test-pass`, `watermark-check`.

Custom document types and custom skills live in `.skills-repo/skills/` and are referenced by name. The lockfile tracks custom vs library and their hashes.

---

## 4. Command surface

```
skills-repo init             # interactive; scaffolds sidecar + artefacts/, writes workflow.yaml
skills-repo status           # where am I in the workflow, what's next, what's blocked
skills-repo run [<step>|next]# drive the next skill (or a specific step)
skills-repo verify [--ci]    # local assurance gate; --ci emits CI-shaped output
skills-repo artefact new <slug>
skills-repo artefact list
skills-repo workflow validate
skills-repo workflow show
skills-repo adopt            # init on an existing repo, with an audit step first
skills-repo new <name>       # greenfield scaffold with sidecar pre-wired
skills-repo upgrade [--to=X] # bump engine/library pins; preview diff
skills-repo uninit           # clean removal of .skills-repo/; artefacts remain
```

`run next` is the common path: read state, find the next step whose `requires` are met, load the skill from the package, drive the interaction.

---

## 5. `init` behaviour

Interactive, idempotent, non-destructive.

1. Detects language/stack, existing `.github/`, existing memory conventions (`CLAUDE.md`, `MEMORY.md`, `handover.md`, SQLite), existing specs/tests.
2. Asks (or reads flags): `unit`, `memory.adapter`, CI posture (`local-only | github-actions | bitbucket | none`), workflow template (preset or `custom`).
3. Writes `.skills-repo/workflow.yaml` + `.skills-repo/profile.yaml`, creates empty `artefacts/` if absent.
4. Offers to add `.skills-repo/state/` and `.skills-repo/cache/` to `.gitignore`.
5. Never touches files outside `.skills-repo/` and `artefacts/` without `--overwrite`.

`uninit` cleanly removes the sidecar. Artefacts are the operator's to keep.

---

## 6. Artefacts folder contract

- One subfolder per feature/experiment/tier — slug set at `artefact new <slug>`.
- File names come from `workflow.yaml.produces`.
- Files become immutable once their step's gate passes (enforced by `verify`; override via `--force-rewrite` with a recorded reason in the trace).
- Committed to git. This is the audit chain the operator ships alongside code.
- No other sprawl. No `workspace/`, `fleet/`, or `standards/` folders in the host repo — those either live inside `.skills-repo/` (as resolved snapshots) or inside the package (as library data).

---

## 7. `adopt` vs `new`

Same engine, two entry points.

- **`adopt`** runs on an existing repo. Starts with an audit (available alone via `skills-repo audit --report`): scans specs, tests, CI, memory, doc conventions, produces a compatibility matrix, and if the host's existing governance is materially different from the requested workflow it **reports reverse-fit and refuses to install conflicting scaffolding** — the operator gets an honest verdict, not a forced graft. Otherwise it drops `.skills-repo/` + `artefacts/` non-destructively.
- **`new`** scaffolds a fresh project with the sidecar pre-wired to a chosen unit and memory adapter. Useful when starting clean (e.g., a greenfield research or product project).

Applied to the surveyed cases:

- **A project with governance materially different from the requested profile** → `audit` reports reverse-fit; the tool declines to install. Operator is pointed at `new` for a clean-slate rebuild.

---

## 8. Distribution

- Language-appropriate install: `npm i -g skills-repo` / `npx skills-repo`, `pipx install skills-repo`, and a static binary via `curl | sh`. All three wrap the same engine; the operator picks one per their stack.
- **Lockfile semantics.** `.skills-repo/lock.json` pins engine version, skill-library version, standards-library version, and per-skill hashes. `skills-repo verify` confirms resolved skills match the lock. This is today's hash-verification surface, re-homed.
- **Upgrade path.** `skills-repo upgrade` bumps pins with a preview diff; downgrade with `--to=<version>`. No forking required to customise — overrides go in `.skills-repo/skills/` and `.skills-repo/standards/`.
- **Fully offline.** Everything is local-file + local-binary. No cloud dependency to install, init, run, verify, or upgrade.

---

## 9. What changes in the current skills-repo repository

The current repo splits into two roles:

1. **Package source** — engine, CLI, skill library, standards library, templates, validators. Published to npm/pipx as `skills-repo`.
2. **Reference / dogfood project** — the current `artefacts/`, `workspace/`, `fleet/`, `.github/` etc. stay as the team's own usage of the tool. They become evidence, not a template. Users do not clone this to adopt.

Concrete moves:
- Extract CLI entrypoint under `src/cli/`; move today's validators to `src/engine/`; add a package build.
- Move `.github/skills/`, `standards/`, `.github/templates/` into a packaged data bundle loaded at runtime from the installed location.
- Define and ship the `workflow.yaml` schema + a small set of built-in presets corresponding to today's skill chain.
- Implement `init`, `status`, `run`, `verify`, `artefact new`, `workflow validate`, `adopt` / `audit`, `new`, `upgrade`, `uninit`.
- Rehome hash-verification onto `lock.json`.
- The current repo's own `artefacts/`, `workspace/`, `fleet/` survive as dogfooding data; they are no longer the user-facing shape.

---

## 10. Non-goals

- Not a vendored repo. No `skills-repo/` source tree inside your project.
- Not a project-management tool. Pipeline state is not a Jira replacement.
- Not opinionated about your production code. The tool drives document + governance flow, not your codegen or lint rules (beyond opt-in `verify` hooks).
- No cloud dependency. Local files, local binary, local verify. Anything remote is a separate concern outside this phase.
- No files dropped outside `.skills-repo/` and `artefacts/`. If a feature wants to, it is the wrong feature.

---

## 11. Summary

One phase, one shape. skills-repo ships as an installable package with a CLI. It sits in a single `.skills-repo/` sidecar, writes to one `artefacts/` folder, and is configured by one `workflow.yaml` declaring document types and order. `init` scaffolds cleanly, `adopt` grafts onto existing repos without overwriting (and refuses when reverse-fit), `new` scaffolds greenfield with the right posture on day zero. The host repo stays clean; the tool stays out of the way until called.

---

## 12. Discussion — will this work, and does it conflict with skills-repo's intent?

Short answer: yes, it will work, and it's **more aligned with skills-repo's stated intent than the current clone model** — but there are three real tensions to resolve deliberately.

### Why it aligns

- The README explicitly states the goal of "a distribution model enabling consumption without forking." Cloning is the opposite of that; a package + sidecar is the concrete delivery of it.
- Hash verification survives intact — re-homed from `.github/skills/*.md` reads into `lock.json` + resolved snapshots in `.skills-repo/skills/`. Same invariant, cleaner surface.
- Artefact chain, traces, standards tiering, progressive disclosure, assurance gate, improvement loop, no-hosted-service — all preserved. `verify` = local assurance, `verify --ci` = the GitHub Actions path.
- Multi-surface adapters are library code; the CLI model doesn't touch them.

### Three tensions to resolve explicitly (or it will look like a breach)

1. **Skill visibility / auditability.** Today an auditor opens `.github/skills/<name>/SKILL.md` in the host repo and reads the rules. If skills live only in the installed package, that's lost. **Mitigation (already in the design):** `.skills-repo/skills/` and `.skills-repo/standards/` are **resolved snapshots committed to git**, not vendored source. Auditor still has everything at the pinned version without cloning upstream.

2. **`workflow.yaml` lets operators sequence skills in ways skill authors didn't anticipate** — directly at odds with "no step skipping, stage-gated, entry conditions strict." Letting someone write a workflow that skips `/definition-of-ready` would undo the core governance claim. **Required:** skill frontmatter declares its compatible units and hard prerequisites; `workflow validate` refuses invalid sequences (missing required predecessors, unsupported units, contradictory gates). Treat `workflow.yaml` as **composition within declared constraints**, not free-form orchestration.

3. **Evidence reproducibility.** Today the trace, the artefacts, and the SKILL.md file the hash referred to are all in one repo. In the product model the SKILL.md body lives in the package version pinned by `lock.json`. **Required:** `skills-repo verify` must be able to re-materialise the exact skill body from the pinned hash, offline, months later. If that round-trip breaks, the governance claim ("this hash proves which rules governed the decision") weakens. Practically: pin the package version in `lock.json`, ship skill bodies inside the versioned package, and keep older versions resolvable (npm/pipx already do this).

### Verdict

It doesn't go against the intent; it delivers it. The risk is not philosophical, it's implementation discipline on those three points. Miss any of them and you inherit the appearance of the governance without the substance.
