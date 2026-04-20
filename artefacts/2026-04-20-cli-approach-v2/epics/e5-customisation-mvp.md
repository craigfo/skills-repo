## Epic: Consumer-side customisation MVP — probe the §16.2 / §16.9 open question

**Discovery reference:** `artefacts/2026-04-20-cli-approach-v2/discovery.md`
**Benefit-metric reference:** `artefacts/2026-04-20-cli-approach-v2/benefit-metric.md`
**Slicing strategy:** Risk-first

## Goal

A platform operator can add one local node to their project's workflow declaration — a customisation extending the upstream graph — without forking upstream. The local node survives `upgrade`: upstream changes merge cleanly with the local customisation preserved. This epic *probes* the open question (reference §16.2 / §16.9: consumer customisation semantics) during MVP rather than deferring it all to post-MVP. If it surfaces structural gaps, the answer ships back into the discovery as a formal SCOPE decision. If it works cleanly, the non-fork property is strengthened.

**Scope-boundary note:** discovery Out of Scope lists "Consumer-side workflow customisation" as phase-deferred. This epic intentionally re-scopes a minimal form into MVP because answering it here preserves non-fork credibility (Risk 6); answering it *only* post-MVP risks discovering at adoption time that a consumer must fork to customise — the failure mode the platform was designed to prevent.

## Out of Scope

- Replacing an upstream skill with a local version — too invasive for MVP; "add one local step" is the minimal probe.
- Removing an upstream skill from a project's declaration — not an MVP need.
- Customising skill hashes — would break P1; prohibited.
- Upgrade conflict resolution UX for customisation collisions — if conflicts arise, halt upgrade for manual resolution is the MVP behaviour (managed-merge pattern from `architecture-guardrails.md`).

## Benefit Metrics Addressed

| Metric | Current baseline | Target | How this epic moves it |
|--------|-----------------|--------|------------------------|
| M5 — Non-fork adoption | Non-fork install + upgrade validated | Non-fork + minimal customisation validated | A consumer who *can* customise without forking has the stronger non-fork property; this epic probes that. |
| A-new (implicit assumption) — Customisation is authorable without structural change | Unvalidated | Validated or surface specific structural gap | The answer feeds §16.2 / §16.9; either confirms MVP shape supports customisation or names the gap. |

## Stories in This Epic

- [ ] v2-custom-add-step — Add one local node to the workflow declaration on project 1; verify upgrade preserves it

## Human Oversight Level

**Oversight:** High
**Rationale:** Customisation is the experimental edge of the MVP; operator reviews every aspect of the authoring + upgrade-preservation flow since gaps surface at structural rather than surface level.

## Complexity Rating

**Rating:** 3

## Scope Stability

**Stability:** Unstable — explicitly a probe; outcome may reshape the Out of Scope framing in discovery.
