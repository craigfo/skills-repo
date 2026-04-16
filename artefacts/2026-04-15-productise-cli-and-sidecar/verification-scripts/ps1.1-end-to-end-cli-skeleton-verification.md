# Verification Script: ps1.1 — End-to-end CLI skeleton

**Story reference:** `stories/ps1.1-end-to-end-cli-skeleton.md`
**Audience:** operator (as reviewer / domain expert proxy), post-merge smoke test.

## Setup

1. Find a directory on your machine with no existing `skills-repo` related folders.
2. Open a terminal there.
3. Ensure the CLI package is installed: `npm i -g skills-repo@<mvp-tag>` (or use the test-local install path).

## Scenario 1 — Clean install produces only two folders (AC1)

1. Create a new empty directory: `mkdir ps1-test && cd ps1-test`.
2. Initialise git: `git init`.
3. Run: `skills-repo init --yes`.
4. Run: `ls -A`.

**Expected:** you see exactly `.git`, `.skills-repo`, `artefacts` — nothing else. If `.gitignore` existed previously you will also see it; if you consented to the prompt, two extra lines appear at the bottom of `.gitignore`.

## Scenario 2 — Gitignore append is only that (AC2)

1. After Scenario 1: `cat .gitignore` (or `tail -3 .gitignore`).

**Expected:** last two lines are `.skills-repo/state/` and `.skills-repo/cache/`. No other lines have changed — compare against a `.gitignore` from before `init` if present.

## Scenario 3 — Running one skill produces one artefact (AC3)

1. In the same `ps1-test` directory: `skills-repo run next`.
2. Run: `ls artefacts/`.

**Expected:** one new sub-folder (e.g. `default/` or a slug). Inside it, one Markdown file produced by the trivial built-in skill. A corresponding `.skills-repo/traces/*.jsonl` file exists.

## Scenario 4 — Refusing on a non-git directory (AC4)

1. Create a directory **without** running `git init`: `mkdir no-git && cd no-git`.
2. Run: `skills-repo init`.

**Expected:** the command prints a clear error like *"current directory is not a git repository"* and exits with a non-zero code. Neither `.skills-repo/` nor `artefacts/` are created.

## Scenario 5 — No surprise writes anywhere else (AC5) 🔴

1. From Scenario 1, immediately after `skills-repo run next`: `git status --porcelain`.

**Expected:** every line starts with `?? .skills-repo/` or `?? artefacts/` (or relates to the approved `.gitignore` append). If you see any path outside those — e.g. a file in the repo root, or anything in `.github/`, `workspace/`, `standards/` — that is a regression. The sidecar contract is broken.

## Reset

Between scenarios, `cd ..` back out and create a fresh test folder. Don't reuse state.
