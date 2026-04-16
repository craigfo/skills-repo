# Test Plan: ps1.1 — End-to-end CLI skeleton

**Story reference:** `stories/ps1.1-end-to-end-cli-skeleton.md`
**Review:** PASS Run 2 (2026-04-15)
**Framework:** Vitest (unit + integration) + bash/Node end-to-end wrappers invoking `skills-repo` binary against temp test repos.
**AC count:** 5

## Test data strategy
**Type:** Synthetic. Tests create a fresh temp git repo in each setup (`mkdtemp` + `git init`) and clean up in teardown. No committed fixtures for this story — the built-in trivial skill is the only content.
**PCI / sensitivity:** None.

## AC coverage table

| AC | Type | Test name |
|---|---|---|
| AC1 | E2E CLI | `init-creates-only-sidecar-and-artefacts-on-clean-repo` |
| AC2 | E2E CLI | `init-appends-gitignore-lines-when-confirmed` |
| AC3 | E2E CLI | `run-next-executes-trivial-skill-and-writes-one-artefact` |
| AC4 | Unit | `init-aborts-non-zero-when-host-is-not-git-repo` |
| AC5 | E2E CLI | `git-status-shows-only-sidecar-and-artefacts-after-any-command` |

## Unit tests

- **`init-aborts-non-zero-when-host-is-not-git-repo`** (AC4) — spawn `init` in a tmp dir with no `.git/`; assert exit code ≠ 0, stderr contains "not a git repository", no `.skills-repo/` or `artefacts/` created.
- **`init-writes-expected-sidecar-layout`** (AC1) — after `init` in a clean git repo, assert presence of `.skills-repo/{workflow.yaml, profile.yaml, lock.json, skills/}` and empty `artefacts/`.

## Integration / E2E tests

- **`init-creates-only-sidecar-and-artefacts-on-clean-repo`** (AC1) — run `skills-repo init --yes` in tmp git repo; snapshot `git status --porcelain` output; assert only entries under `.skills-repo/`, `artefacts/`, and (if prompted default-yes) two new `.gitignore` lines.
- **`init-appends-gitignore-lines-when-confirmed`** (AC2) — run `init` with `.gitignore` absent and with existing `.gitignore` (both cases); assert two new lines appended at end of file; no other lines changed (diff compared byte-wise).
- **`run-next-executes-trivial-skill-and-writes-one-artefact`** (AC3) — after `init`, run `skills-repo run next`; assert exit 0, exactly one new file under `artefacts/<slug>/`, one JSONL line under `.skills-repo/traces/`.
- **`git-status-shows-only-sidecar-and-artefacts-after-any-command`** (AC5) — wrapper matrix: for each CLI command (init, run next), assert `git status --porcelain | grep -vE '^\?\? (\.skills-repo|artefacts|\.gitignore)'` is empty.

## NFR tests

- **`init-completes-under-10-seconds-on-clean-repo`** (NFR performance) — time `init`; assert wall-clock < 10 s.
- **`no-credentials-or-env-vars-logged`** (NFR security) — run CLI commands with `DEBUG=*`; grep captured stderr+stdout for common credential patterns; assert none.
- **`run-next-writes-one-trace-jsonl-line`** (NFR audit) — after `run next`, assert `.skills-repo/traces/*.jsonl` exists with a line containing `timestamp`, `command`, `status` fields.

## Gap table

No gaps. All ACs testable at unit / integration / E2E level with the proposed harness. No CSS-layout-dependent ACs.

## TDD discipline note

Every test above is written to fail against the current state (no CLI implementation exists). The `init-aborts-non-zero-when-host-is-not-git-repo` test is the first test implemented — it fails when no CLI exists (command not found exits 127, which is ≠ 0 but fails the stderr assertion; an incomplete CLI stub must implement the abort path before the test passes).
