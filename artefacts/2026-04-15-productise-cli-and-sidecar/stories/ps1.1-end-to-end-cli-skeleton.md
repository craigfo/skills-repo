## Story: End-to-end CLI skeleton — install the package, run `init`, run `run next`, produce one artefact

**Epic reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/epics/epic-1-walking-skeleton.md`
**Discovery reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-15-productise-cli-and-sidecar/benefit-metric.md`

## User Story

As a **skills-repo maintainer (operator)**,
I want to **install a CLI package and run two commands on a clean git repo to produce one artefact file**,
So that **the full install → init → produce shape works end-to-end before any fetch, lockfile, or preset machinery exists** (M1 sidecar-only footprint enforced from day one; MM1 seeded).

## Benefit Linkage

**Metric moved:** M1 — Sidecar-only footprint (primary); MM1 — Dogfood delivery on packaged CLI (partial; seeds the first run).
**How:** This story stands up the minimum CLI surface that writes *only* to `.skills-repo/` and `artefacts/`. Every subsequent change can regress M1; establishing it here in the skeleton means the regression test exists before any complexity is added.

## Architecture Constraints

- **Guardrail (new, proposed):** CLI package introduces a scope not covered by today's `architecture-guardrails.md` (which targets `pipeline-viz.html`, `pipeline-state.schema.json`, `.github/scripts/`). A new guardrail entry — "CLI commands never write outside `.skills-repo/` or `artefacts/` except the optional one-line `.gitignore` append" — will be proposed at `/review` Category E.
- Otherwise: None identified — checked against `.github/architecture-guardrails.md`.

## Dependencies

- **Upstream:** None (first story, walking skeleton root).
- **Downstream:** All subsequent stories (ps2.1–ps3.3) build on this skeleton.

## Acceptance Criteria

**AC1:** Given the CLI package has been installed (via `npm i -g skills-repo` or equivalent test-local install), When the operator runs `skills-repo init` in a clean empty git repo, Then the repo contains exactly these new paths at the top level: `.skills-repo/` and `artefacts/`; `.skills-repo/` contains `workflow.yaml`, `profile.yaml`, `lock.json` (placeholder), and a `skills/` directory containing one built-in trivial skill file; `artefacts/` is empty. `git status --porcelain` shows no modifications to any file outside those two paths.

**AC2:** Given `init` has completed and the operator has confirmed the optional `.gitignore` append prompt, Then `.gitignore` contains two new lines (`.skills-repo/state/` and `.skills-repo/cache/`) appended at the end; no other `.gitignore` change is made.

**AC3:** Given the sidecar from AC1 exists, When the operator runs `skills-repo run next`, Then the built-in trivial skill executes (writes a fixed string artefact to `artefacts/<slug>/<filename>.md`), the artefact file exists, `git status --porcelain` shows only additions under `.skills-repo/state/`, `.skills-repo/traces/`, and `artefacts/<slug>/`, and the CLI exits with status 0.

**AC4:** Given `init` is run in a directory that is not a git repository, Then `skills-repo init` exits non-zero with a clear error message ("current directory is not a git repository") and does not create `.skills-repo/` or `artefacts/`.

**AC5:** Given any CLI command has completed, When `git status --porcelain` is run in the host repo, Then the output contains no modifications to files outside `.skills-repo/` or `artefacts/` (and — if the operator confirmed the prompt at `init` — at most the two approved lines appended to `.gitignore`).

## Out of Scope

- Real fetch from a source URL — the built-in skill for this story is literally compiled into the package binary. Epic 2 replaces it.
- Hash verification / `lock.json` semantics — placeholder file only; no assertions.
- Any command other than `init` and `run next`.
- Custom workflow — the workflow is hard-coded for this story.

## NFRs

- **Performance:** `init` completes in under 10 seconds on a clean repo (network access not required by this story).
- **Security:** No credentials, tokens, or environment variables are read or logged by any command in this story.
- **Accessibility:** N/A (CLI-only).
- **Audit:** `run next` writes one JSONL line to `.skills-repo/traces/` with `{timestamp, command, status}` — minimum audit surface for MM2 tracking.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable

## Definition of Ready Pre-check

- [ ] ACs are testable without ambiguity
- [ ] Out of scope is declared (not "N/A")
- [ ] Benefit linkage is written (not a technical dependency description)
- [ ] Complexity rated
- [ ] No dependency on an incomplete upstream story
- [ ] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic
