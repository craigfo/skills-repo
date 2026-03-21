# Changelog

All notable changes to this repository will be documented in this file.

## [Unreleased]

### Added
- **Pipeline visualizer — in-viz markdown editor, Phase 1–4** (`pipeline-viz.html`): full read/edit/diff workflow for pipeline artefacts directly inside the visualizer, across four shipped phases:
  - **Phase 1** (`7e1d336`): Preview / Markdown tabs, `localStorage` draft save + reset, status chip, and a keyboard guard in the raw editor.
  - **Phase 2** (`a94af45`): Template-aware validation panel (story AC format, benefit-metric placeholders, test-plan AC coverage, DoR checklist progress) and a story AC form editor with add/delete AC rows.
  - **Phase 3** (`8f3049d`): Inline diff view (LCS, capped 250 k cells), unified-patch copy, and conflict detection (FNV-1a hash of original text on save; warns on reopen if the file on disk has diverged).
  - **Phase 4** (`010ef67`): "📦 VS Code" button (constructs `vscode://file/…` URI), "✨ Suggest" button (copies a ready-to-paste Copilot chat prompt containing the full diff), Drafts panel (scans `localStorage` for all saved drafts, lists artefact type + Open/Discard per entry with a live count badge), and viewer keyboard shortcuts (`d` = diff tab, `s` = save draft, `Esc` closes draft list before closing viewer).
- **Stage artefact links on active feature cards** (`1b366ec`): each open feature card now shows a `Docs` row listing clickable links to the current stage's artefact `.md` files (story, test-plan, DoR, epic, benefit-metric, etc.). Clicking opens the md viewer directly.
- **Test artefacts seeded** (`010ef67`): `ws-portal-modernisation` story, test-plan, and DoR artefacts added for browser testing.
- **README — simple pipeline flow diagram**: a linear `flowchart LR` covering the standard feature journey from idea to release, positioned before the full diagram.
- **Pipeline visualizer — Governance view** (`pipeline-viz.html`): new `🛡 Governance` tab (keyboard shortcut `v`) showing a 7-gate compliance matrix across all features. Gates reference their governing skill (`/review`, `/test-plan`, `/definition-of-ready`, `/verify-completion`, `/definition-of-done`, `/trace`, `/release`).
  - Gate-click filtering: click any failing-gate pill to filter the matrix to affected features only.
  - CSV export of the full governance matrix (`governance-matrix.csv`).
  - Strict policy mode: when enabled, `warn` statuses on regulated features are escalated to `fail`.
  - `complianceProfile: "regulated"` feature field drives strict policy targeting.
  - Added in `52c4b06`.
- **Live skill criteria loading** (`pipeline-viz.html`): governance view Gate Criteria Reference panel now fetches and parses YAML frontmatter `description:` from each gate's `SKILL.md` file at load time.
  - Covers all 7 gate skills plus `/workflow` and `/org-mapping` (pipeline authority skills, shown in collapsible section).
  - Per-card `live` (green) / `default` (grey) badge shows whether criteria came from the live file or the hardcoded fallback.
  - Summary badge shows how many of 7 skills loaded live.
  - Automatic: editing any SKILL.md description is reflected in the governance view on next page reload — no manual sync needed.
  - Silently falls back to hardcoded one-liner criteria when served over `file://` or if a file is unavailable.
  - Added in `52c4b06`.
- **Pipeline visualizer — Action state system** (`pipeline-viz.html`): action-state chips on every feature card (`human` / `processing` / `blocked` / `done`), stale processing detection (2-hour threshold), and an Action Queue panel pinned above the board (oldest-first, click-to-focus).
- **Pipeline visualizer — Guarded stage transitions** (`pipeline-viz.html`): `Move to X` buttons with per-gate guardrail blocking messages.
- **Sample data** (`pipeline-state.sample.json`): added `complianceProfile: "regulated"` to two existing features; added `payments-kms-key-rotation` regulated feature with a blocked DoR story to demonstrate strict policy escalation.

### Changed
- Renamed `Health` filter label to `Risk` in the visualizer header (with tooltip clarifying semantic difference from `Action` filter).
- `GOVERNANCE_GATES` constant now includes a `skillPath` field per gate pointing to the corresponding `SKILL.md` relative path.
- Added `META_SKILL_REFS` constant for pipeline-authority skills (`/workflow`, `/org-mapping`) that inform gate context but are not gate-checked themselves.

### Fixed
- Fixed invalid JSON prefix (`1. option{`) in `pipeline-state.sample.json` that prevented the visualizer from loading.
- Fixed stray closing brace in `pipeline-viz.html` (~line 1080) that caused `Uncaught SyntaxError: Unexpected token '}'` and broke the board render entirely.

### Removed
- **"Move to [stage]" button** (`f8b98a9`): removed from all feature cards. The button only mutated in-memory stage state; real stage transitions are driven by the skills, which write `pipeline-state.json` with proper guardrails and artefact creation. A UI shortcut that bypasses that is misleading. `canAdvanceFeature()`, the `advance-feature` event handler, and the `.next-action-btn` CSS are all gone.

---

---

- Added context-driven EA registry source-of-truth fields in profiles:
  - `architecture.ea_registry_repo`
  - `architecture.ea_registry_local_path`
  - `architecture.ea_registry_authoritative`
  - Added in `6c4e250`.
- Added four pipeline evolution skills:
  - `/loop-design`
  - `/token-optimization`
  - `/org-mapping`
  - `/scale-pipeline`
  - Added in `c9396f2`.
- Added four new templates:
  - `.github/templates/loop-design.md`
  - `.github/templates/token-optimization.md`
  - `.github/templates/org-mapping.md`
  - `.github/templates/scale-pipeline.md`
  - Added in `c9396f2`.

### Changed
- Refactored pipeline behavior to a hybrid model:
  - Keep strategic skills discrete (`/loop-design`, `/scale-pipeline`).
  - Embed token optimization and org-mapping policy overlays into core execution/review/release skills.
  - Implemented in `514e8ab`.
- Made release generation context-driven using `.github/context.yml` tool and governance fields.
  - Implemented in `d92b4cb`.
- Added explicit active-context mechanism and profile strategy (`.github/context.yml` + `.github/contexts/*`).
  - Implemented in `7cccf81`, `a817c38`.

### Fixed
- Removed hardcoded toolchain and environment assumptions across skills for portability.
  - Implemented across `3d7e508`, `7cccf81`, `a817c38`.
- Updated docs for context-based configuration and live `testPlan.passing` visualizer progress behavior.
  - Implemented in `7bdb8b0`.

---

## [0.1.0] - 2026-03-20

### Initial tracked release notes baseline
- Bootstrapped and hardened the SDLC skill pipeline with structured artefacts, templates, and workflow/state conventions.
- Added enterprise architecture registry integration and context-driven portability model.
- Added pipeline evolution capability (loops, token optimization, org mapping, scale) and moved to hybrid embedded policy behavior in core skills.
