# NFR Profile: 2026-04-20-cli-approach-v2

**Feature:** CLI approach for AI-assisted workflow (v2)
**Created:** 2026-04-20
**Last updated:** 2026-04-20
**Status:** Active

---

## Performance

| NFR | Target | Measurement method | Applies to story |
|-----|--------|--------------------|-----------------|
| `init` completion time | < 30s for typical upstream (~50 files) on standard broadband | Wall-clock timer on install | v2-install-init |
| Pre-flight collision check | < 2s for typical repo (≤1000 files in whitelist) | Wall-clock timer | v2-install-collision-detection |
| `advance` latency per call (envelope build + hash verify + state advance) | < 3s | Inherited from `p4-enf-cli` NFR; adapter-code owned | v2-e2e-project1, v2-e2e-project2 |

**Source:** Story ACs / inherited from `p4-enf-cli`.

Feature-level note: no aggregate throughput / load targets — the CLI is a local tool invoked by a single operator per invocation; no multi-tenant or high-concurrency path in scope.

---

## Security

| NFR | Requirement | Standard or clause | Applies to story |
|-----|-------------|-------------------|-----------------|
| Credentials handling | No credentials, PAT tokens, or session data in any CLI output, lockfile, trace, config, or doc | MC-SEC-02 + `product/constraints.md` §12 | Every story |
| Input validation (CLI flags/args) | Malformed paths, non-existent upstream, invalid lockfiles surface as typed errors, not unhandled exceptions | Repo safety | v2-install-init, v2-install-collision-detection, v2-e2e-upgrade |
| Hash bypass path | Prohibited — no `--skip-verify` or equivalent flag | C5 (`product/constraints.md` §5) + inherited from `p4-enf-cli` NFR | Every story that calls `advance` |
| Consumer-owned paths protection | Permanent-exclusion list hardcoded in CLI; consumer cannot disable | Spike C addendum-1d | v2-install-init, v2-install-collision-detection, v2-e2e-upgrade |
| Audit logging | Every `advance`/`back`/`navigate` emits a trace entry matching `scripts/trace-schema.json` | ADR-003 repo-level (hash-verified instruction sets) | v2-e2e-project1, v2-e2e-project2, v2-custom-add-step |

**Data classification:**

- [x] **Public / Internal** — the feature produces artefacts (workflow declarations, lockfiles, traces) that are repo-tracked but contain no PII, no customer data, no regulated data. Classification is per the project the CLI is installed into; for the two validation projects, classification depends on the project.
- [ ] Confidential
- [ ] Restricted

**Source:** `.github/architecture-guardrails.md` mandatory constraints + `product/constraints.md` §12 (credentials structural) + MC-SEC-02.

---

## Data residency

| Requirement | Region / boundary | Regulatory basis | Applies to story |
|-------------|------------------|-----------------|-----------------|
| Not applicable | — | — | — |

**Source:** Not applicable — the CLI is a local tool; artefacts stay on the operator's machine and in the consumer repo; no hosted runtime per C11. Cross-region data movement not introduced.

---

## Availability

| NFR | Target | Measurement window | Notes |
|-----|--------|--------------------|-------|
| Uptime SLA | Not defined | — | CLI is a local tool, no service uptime concept. |
| RTO / RPO | Not defined | — | State is in sidecar + git; recovery is `git checkout`. |
| Planned maintenance window | Not applicable | — | No hosted runtime per C11. |

**Source:** Not applicable for a local CLI tool.

---

## Compliance

| Framework / regulation | Relevant clause(s) | Obligation | Applies to story |
|-----------------------|-------------------|-----------|-----------------|
| None currently | — | — | — |

**Named sign-off required?**
- [x] Not required — `.github/context.yml` has `meta.regulated: false`; Theme F compliance integration is out-of-scope per discovery.
- [ ] Yes

**Note:** If the feature later targets a regulated consumer (Theme F engagement), a compliance addendum to this profile is required before that consumer's DoR sign-off. Not an MVP concern.

---

## NFR AC blocks

> These are copy-pasteable AC blocks for individual stories.

**Hash bypass prohibition (security):**
```
Given a workflow advance is requested
When the CLI command is invoked with any flag attempting to skip hash verification
Then the CLI rejects the invocation with a structured error and no envelope is built
```

**Credential absence (security / audit):**
```
Given any CLI output, trace, or lockfile file produced by this feature
When it is inspected by grep for known credential patterns (PAT, API token, session cookie formats)
Then zero matches are found
```

**Exclusion-list protection (security):**
```
Given a repo with operator-authored files at permanent-exclusion paths
When init or upgrade runs
Then git diff across the exclusion list shows zero modifications
```

---

## Gaps and open questions

| NFR area | Gap | Owner | Due |
|----------|-----|-------|-----|
| Performance — workflow-declaration authoring cost | Not yet benchmarked; authoring burden is an A5 signal but not a hard NFR | Operator | Epic 2 completion |
| Compliance — Theme F engagement | Follow-up compliance profile required if Theme F engages a regulated consumer | Operator + heymishy | Post-MVP |
| Availability — operator-machine failure mid-cycle | Not addressed (tool is local; no redundancy); recovery is via git checkpoint | — | Not in MVP scope |
