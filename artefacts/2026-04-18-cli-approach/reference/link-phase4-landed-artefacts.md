# Link: Phase 4 landed artefacts (from heymishy master)

**This is a pointer file.** All targets are in-tree — master was merged into this branch 2026-04-18. Paths below are repo-relative to this reference folder.

These supersede (or substantially clarify) several sections of the original strategic horizon document (`link-ref-skills-platform-phase4-5.md`). Read these first; treat phase4-5 as backgrounder.

---

## 1. Canonical architectural decisions

- **ADR register (includes ADR-013 Phase 4 enforcement architecture):** [`../../../.github/architecture-guardrails.md`](../../../.github/architecture-guardrails.md)
- **Phase 4 decisions log** (includes Spike C resolution — upstream authority, lockfile, sidecar, zero-commit): [`../../2026-04-19-skills-platform-phase4/decisions.md`](../../2026-04-19-skills-platform-phase4/decisions.md)

## 2. Phase 4 outer-loop foundation

- **Discovery:** [`../../2026-04-19-skills-platform-phase4/discovery.md`](../../2026-04-19-skills-platform-phase4/discovery.md)
- **Benefit-metric:** [`../../2026-04-19-skills-platform-phase4/benefit-metric.md`](../../2026-04-19-skills-platform-phase4/benefit-metric.md)
- **Experiment scorecard / NFR profile / scope accumulator:** in the same folder.

## 3. Spike outputs (DoD-complete)

- **Spike A — governance extractability:** DoD [`../../2026-04-19-skills-platform-phase4/dod/p4-spike-a-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-spike-a-dod.md) · raw output [`../../2026-04-19-skills-platform-phase4/spikes/spike-a-output.md`](../../2026-04-19-skills-platform-phase4/spikes/spike-a-output.md)
- **Spike B1 — CLI + MCP boundary enforcement:** DoD [`../../2026-04-19-skills-platform-phase4/dod/p4-spike-b1-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-spike-b1-dod.md) · raw output [`../../2026-04-19-skills-platform-phase4/spikes/spike-b1-output.md`](../../2026-04-19-skills-platform-phase4/spikes/spike-b1-output.md)
- **Spike B2 — orchestration + schema enforcement** (**not** CLI, despite earlier phase4-5 doc suggesting otherwise): DoD [`../../2026-04-19-skills-platform-phase4/dod/p4-spike-b2-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-spike-b2-dod.md) · raw output [`../../2026-04-19-skills-platform-phase4/spikes/spike-b2-output.md`](../../2026-04-19-skills-platform-phase4/spikes/spike-b2-output.md)
- **Spike C — distribution model:** raw output [`../../2026-04-19-skills-platform-phase4/spikes/spike-c-output.md`](../../2026-04-19-skills-platform-phase4/spikes/spike-c-output.md)

## 4. Directly CLI-relevant

- **E3 epic (structural enforcement):** [`../../2026-04-19-skills-platform-phase4/epics/e3-structural-enforcement.md`](../../2026-04-19-skills-platform-phase4/epics/e3-structural-enforcement.md)
- **CLI enforcement DoR + story + test-plan + verification:** [`../../2026-04-19-skills-platform-phase4/dor/p4-enf-cli-dor.md`](../../2026-04-19-skills-platform-phase4/dor/p4-enf-cli-dor.md) · [`../../2026-04-19-skills-platform-phase4/stories/p4-enf-cli.md`](../../2026-04-19-skills-platform-phase4/stories/p4-enf-cli.md) · [`../../2026-04-19-skills-platform-phase4/test-plans/p4-enf-cli-test-plan.md`](../../2026-04-19-skills-platform-phase4/test-plans/p4-enf-cli-test-plan.md) · [`../../2026-04-19-skills-platform-phase4/verification-scripts/p4-enf-cli-verification.md`](../../2026-04-19-skills-platform-phase4/verification-scripts/p4-enf-cli-verification.md)
- **Enforcement decision DoR** (which mechanism for which surface): [`../../2026-04-19-skills-platform-phase4/dor/p4-enf-decision-dor.md`](../../2026-04-19-skills-platform-phase4/dor/p4-enf-decision-dor.md)

## 5. Parallel Opus draft (alternative framing)

- [`../../2026-04-19-skills-platform-phase4-opus/`](../../2026-04-19-skills-platform-phase4-opus/) — earlier Opus-generated Phase 4 draft with different epic numbering (e1-e4 mapping differently). Compare if useful; likely superseded by the non-opus folder above.

## 6. Previously-pointer reference (status: backgrounder)

- `link-ref-skills-platform-phase4-5.md` (this folder) → the strategic horizon document that originally informed this feature. Still useful for framing and the five-mechanism matrix; several forward-looking sections now answered by the spike DoDs and decisions above.

## 7. Implementation scaffold — `src/enforcement/` (LANDED AFTER FIRST CLARIFY RUN)

heymishy has built the implementation skeleton of the enforcement adapter pattern. These landed between the first `/clarify` run and the re-run.

- **`../../../src/enforcement/cli-adapter.js`** — CLI enforcement adapter. **Exposes exactly the 9 commands from this feature's discovery**: `init`, `fetch`, `pin`, `verify`, `workflow`, `advance`, `back`, `navigate`, `emitTrace`. **Status: scaffold.** Seven of nine commands return `{ status: 'ok', command: '...' }` with no real logic. The two with substantive logic are `advance` (transition validation per ADR-002 + hash verification per C5 + state advancement via `govPackage.verifyHash` + `govPackage.advanceState`; returns typed errors `TRANSITION_NOT_PERMITTED` / `HASH_MISMATCH`) and `emitTrace` (validated trace entry — skillHash, inputHash, outputRef, transitionTaken, surfaceType, timestamp; MC-SEC-02 compliant).
- **`../../../src/enforcement/governance-package.js`** — the shared governance core. Spike A's verdict: extractability is feasible. The adapters call into this.
- **`../../../src/enforcement/mcp-adapter.js`** — peer MCP enforcement adapter (for the other surface type per phase4-5's matrix).
- **`../../../src/enforcement/schema-validator.js`** — structured-output validation shared across adapters.

## 8. Additional supporting artefacts landed with the scaffold

- **Spike C DoD:** [`../../2026-04-19-skills-platform-phase4/dod/p4-spike-c-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-spike-c-dod.md)
- **p4-enf-package DoD** (governance-package implementation): [`../../2026-04-19-skills-platform-phase4/dod/p4-enf-package-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-enf-package-dod.md)
- **p4-enf-schema DoD** (schema validator): [`../../2026-04-19-skills-platform-phase4/dod/p4-enf-schema-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-enf-schema-dod.md)
- **p4-enf-second-line DoD** (second-line independence deliverables — directly relevant to the Theme F scope question in this feature's discovery): [`../../2026-04-19-skills-platform-phase4/dod/p4-enf-second-line-dod.md`](../../2026-04-19-skills-platform-phase4/dod/p4-enf-second-line-dod.md)
- **Theme F inputs:** [`../../2026-04-19-skills-platform-phase4/theme-f-inputs.md`](../../2026-04-19-skills-platform-phase4/theme-f-inputs.md) — authoritative list of what Theme F actually covers. Use this to decide which Theme F items the discovery wrongly absorbed.
- **Trace schema:** [`../../../scripts/trace-schema.json`](../../../scripts/trace-schema.json) — canonical JSON schema for trace entries (resolves reference §16.12).

---

## What the clarify agent should take from these

- **Spike B2 is not CLI.** heymishy's B2 scope is orchestration-schema-enforcement; CLI is a separate mechanism (see `p4-enf-cli`). The cli-approach feature's earlier framing as "Spike B2 reference implementation" is off — CLI is one mechanism within E3 (structural enforcement), not specifically B2.
- **Spike C resolved the distribution questions** §16 had deferred (§16.1, 16.2, 16.3, 16.8, 16.9, 16.10). Read Spike C output; fold conclusions into discovery rather than listing them as spike-deferred.
- **Spike A resolved governance extractability** — the major unknown in the phase4-5 strategic doc. Verdict is in its DoD: determines whether the feature is positioned as an adapter around a shared core, or a separate implementation aligning on skill format + trace schema only.
- **ADR-013 is the canonical Phase 4 enforcement architecture decision.** Reconcile any discovery claims that imply a different architecture.
- **`src/enforcement/cli-adapter.js` implements exactly this feature's 9-command design.** Not a competing design — heymishy scaffolded craigfo's spec. The discovery's command set is confirmed in code; the seven unimplemented stubs are where implementation work lives.
- **`theme-f-inputs.md` is authoritative for Theme F scope.** Use it to decide which of the four "Theme F contributions" the first `/clarify` run absorbed genuinely belong to this feature versus belong to Theme F itself. Expect most to belong to Theme F and be rolled back from the discovery.
- **`scripts/trace-schema.json` is the canonical trace schema.** Resolves reference §16.12 directly — no need to treat it as Spike A-gated.
