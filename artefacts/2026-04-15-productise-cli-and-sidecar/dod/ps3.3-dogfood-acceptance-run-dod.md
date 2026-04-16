# Definition of Done: ps3.3 — Dogfood acceptance run

**Status:** COMPLETE
**Date:** 2026-04-15

## AC verification

| AC | Evidence | Result |
|----|---|---|
| AC1 full chain end-to-end on dogfood repo | `scripts/dogfood-run.sh` — 5/5 steps produced; sequence `definition → test-plan → dor → implement (external) → dod` | ✅ |
| AC2 time-to-first-artefact measured + recorded | Evidence JSON: `timeToFirstArtefactSeconds: 3` (target <900, min signal <1800) | ✅ |
| AC3 `git status --porcelain` shows only approved paths | Script asserts this; M1 check pass | ✅ |
| AC4 resume-after-pause (≥24h simulated) | Addressed at the ps3.1/ps3.2 state-file level (`lastActivity` written by every state write); full 24h simulation deferred per the SCOPE M3-window decision | ⚠️ partial — 24h simulation not in this dogfood run; structural path is proven via status tests |
| AC5 incidents file reviewed | `workspace/productisation-incidents.md` — zero entries at MVP close | ✅ |
| AC6 round-trip re-run on dogfood lockfile | Same fetch/lockfile/hash code paths drive both; ps2.3 harness runs as part of `npm test` and was green during ps3.3 | ✅ |

## Dogfood evidence (excerpt)

```json
{
  "start":            "2026-04-15T…",
  "end":              "2026-04-15T…",
  "totalSeconds":     4,
  "initSeconds":      0,
  "timeToFirstArtefactSeconds": 3,
  "slug":             "ps3-dogfood-demo",
  "stepsCompleted":   ["definition","test-plan","definition-of-ready","implement","definition-of-done"],
  "m1SidecarFootprint": "pass",
  "m2TimeToFirstArtefactSeconds": 3,
  "cliHash":          "afb17ab7fcfa366a331450fd0297d05cf6432628"
}
```

Full evidence JSON + captured traces are written to
`workspace/dogfood-evidence/` (gitignored to keep the repo clean;
reproducible via `bash cli/scripts/dogfood-run.sh`).

## Metric signals — MVP close

| Metric | Signal | Detail |
|---|---|---|
| M1 sidecar-only footprint | 🟢 | Dogfood run asserted `git status` clean; also enforced in every unit test. |
| M2 time-to-first-artefact | 🟢 | 3 s — far below target (<15 min) and minimum signal (<30 min). |
| M3 resume-after-pause | 🟡 | Structural path proven (state writes, status command); 24h/7d simulation deferred to post-MVP gate per decision. |
| M4 auditor self-service | 🟢 | `.skills-repo/skills/` snapshots byte-identical; lockfile links trace → content. |
| M5 cross-machine round-trip | 🟢 | `npm test` runs the ps2.3 harness end-to-end; 5/5 match on every run. |
| MM1 dogfood on packaged CLI | 🟢 | This is the dogfood run. Installed tarball, ran chain, produced artefacts. |
| MM2 no §12-tension incidents | 🟢 | `workspace/productisation-incidents.md` empty. |
| MM3 fetch-and-pin held | 🟢 | Round-trip + dogfood + all lock.test.ts pass. |

## Scope deviations
- AC4 24h/7d resume simulation deferred — logged as post-MVP gate in
  `decisions.md` (2026-04-15 SCOPE M3 resume window).
- Dogfood installation uses a local tarball (`npm pack` + `npm i -g
  --prefix`) rather than a public npm registry publish — flagged up front;
  registry publish is a separate release decision.

## Architecture compliance
- ✅ Guardrail MC-CLI-01 honoured through the full chain.
- ✅ `tsx` moved from devDependencies to dependencies so the bin shim works
  after a production install (no silent ps1.1 regression).
- ✅ Artefacts under `workspace/dogfood-evidence/` gitignored to avoid
  repo-bloat and keep MVP-M1 green in this repo too.

## Evidence artefacts
- `cli/scripts/dogfood-run.sh`
- `workspace/productisation-incidents.md`
- `workspace/dogfood-evidence/run-*.json` (gitignored, reproducible)
- `workspace/dogfood-evidence/traces-*/*.jsonl` (captured JSONL from the dogfood run)
