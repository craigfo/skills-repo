# Quickstart

## What is this?

**skills-repo** is a CLI that installs a small sidecar into any git project to drive an AI-assisted delivery pipeline — discovery, definition, test plans, definition-of-ready, implementation, definition-of-done — without polluting your repo.

The whole footprint in a host project is two folders:

```
your-project/
├── .skills-repo/     # config, resolved skills, state, lockfile, traces
└── artefacts/        # the documents the pipeline produces (committed)
```

No hosted service. No cloud. Skills and standards are fetched once from a configurable git source and pinned by SHA-256 in a lockfile. Every command runs offline after install.

## Why you might want to use it

- **You want a structured AI-assisted delivery loop** — discovery through DoD — without inventing one from scratch.
- **You want your host repo to stay clean.** `git status` should show only two top-level paths changed after a full pipeline run.
- **You want the skill and standards content to live upstream**, not forked into your repo, so consumer updates don't require a merge.
- **You want every decision traceable** to the exact skill body that governed it, with a cryptographic lockfile anchoring the chain.

If none of that resonates, you're probably not the target user yet — it's an MVP, shaped around a single operator dogfooding through real delivery.

---

## Install (fastest path — 2 minutes)

Requires Node ≥ 18, npm, git.

```bash
git clone https://github.com/craigfo/skills-repo
cd skills-repo/cli
npm install
npm pack
npm i -g ./skills-repo-0.1.0-mvp.1.tgz
```

Verify:

```bash
skills-repo --help
```

## Use it on your project

```bash
cd ~/path/to/your-project        # must be an existing git repo
skills-repo init --yes           # scaffolds .skills-repo/ + artefacts/
skills-repo status               # prints pipeline position
skills-repo run next             # runs the next pending step
```

That's the skeleton mode — uses a single built-in skill, good for a smoke test.

### Sourced mode — real 5-step workflow

Point `init` at a git source whose root contains `skills/*.md` and `standards/*.md` matching the `story-unit-min` preset (`cli/src/engine/preset.ts`):

```bash
skills-repo init --yes \
  --source=<git-https-url> \
  --ref=<tag-or-commit>

skills-repo artefact new my-feature
skills-repo run next                    # scaffolds artefacts/my-feature/definition.md
# edit the file to do the step's work …
skills-repo run next                    # moves to test-plan.md
skills-repo run next                    # moves to dor.md
skills-repo run next                    # exits 2 — `implement` is external
# do the implementation (write code, ship a PR, whatever) …
skills-repo artefact my-feature mark-step-done implement
skills-repo run next                    # moves to dod.md
skills-repo run next                    # "workflow complete"
```

Pause any time. Come back tomorrow, run `skills-repo status`, and `skills-repo run next` resumes where you left off.

## Uninstall

```bash
npm uninstall -g skills-repo
```

Your `.skills-repo/` and `artefacts/` in the host project stay. Delete them yourself when you no longer need the audit trail.

---

## Commands at a glance

| Command | What it does |
|---|---|
| `skills-repo init [--yes] [--source=<url> --ref=<tag>]` | Scaffold the sidecar; optionally fetch skills + pin a lockfile. |
| `skills-repo status` | Current feature, preset, next step, last activity. |
| `skills-repo run next` | Execute the next pending workflow step. |
| `skills-repo artefact new <slug>` | Start a new feature folder. |
| `skills-repo artefact <slug> mark-step-done <step>` | Mark an external step complete. |

Exit codes: `0` ok · `1` blocking / sidecar not init · `2` external checkpoint / usage · `3` missing `lock.json` · `4` lockfile file missing · `5` hash mismatch.

---

## Under the hood

- Architecture notes and the design decisions behind this shape live in [`artefacts/2026-04-15-productise-cli-and-sidecar/`](./artefacts/2026-04-15-productise-cli-and-sidecar/) — start with `discovery.md` and `decisions.md` (ADR-001 is the fetch-at-`init` choice).
- If you want to develop on the CLI itself, see [`cli/`](./cli/) — `npm test` runs 50 vitest tests plus a cross-environment hash round-trip harness.

---

## Report problems

- `init` wrote somewhere other than `.skills-repo/` or `artefacts/` → guardrail MC-CLI-01 violated; please open an issue with the exact output. The whole thesis depends on this staying true.
- Any other broken behaviour on a fresh clone → issue with the command and output.
