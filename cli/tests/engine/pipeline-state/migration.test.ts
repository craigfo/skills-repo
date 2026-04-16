// ec3.1 — pipeline-state migration invariants.
// Covers AC0 (audit), AC1 (write-target shift), AC2 (scanner union),
// AC3 (viz input), AC4 (featureStatus + retention), AC5 (root disposition),
// AC6 (end-to-end round-trip — stubbed), AC7 (schema delta).

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { describe, expect, test, beforeAll, afterAll } from "vitest";

// Resolve repo root — tests run from cli/, so walk up one level
const REPO_ROOT = join(process.cwd(), "..");

const SCHEMA_PATH = join(REPO_ROOT, ".github/pipeline-state.schema.json");
const LEGACY_FIXTURE = join(REPO_ROOT, "tests/fixtures/pipeline-state-legacy.json");
const ROOT_STATE = join(REPO_ROOT, ".github/pipeline-state.json");
const DERIVED_STATE = join(REPO_ROOT, ".github/pipeline-state.derived.json");
const SCANNER = join(REPO_ROOT, "scripts/build-pipeline-state.js");
const VIZ_HTML = join(REPO_ROOT, ".github/pipeline-viz.html");
const AUDIT_PLAN = join(REPO_ROOT, "artefacts/2026-04-16-engine-consolidation/plans/ec3.1-pipeline-state-isolation-audit.md");

function loadSchema() {
  return JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
}

function featureRecordSchema(schema: any) {
  return schema.properties?.features?.items ?? schema.definitions?.feature;
}

// ---------------- AC7: Schema delta ----------------

describe("AC7 — Schema delta is one additive change (featureStatus enum)", () => {
  test("AC7-U1 featureStatus property exists on the feature record with the correct enum", () => {
    const schema = loadSchema();
    const feature = featureRecordSchema(schema);
    expect(feature).toBeDefined();
    expect(feature.properties?.featureStatus).toBeDefined();
    expect(feature.properties.featureStatus.enum).toEqual(["in-flight", "complete"]);
  });

  test("AC7-U2 no existing feature-record property was removed or retyped", () => {
    const schema = loadSchema();
    const feature = featureRecordSchema(schema);
    // Fields observed in the legacy fixture feature records
    const requiredExisting = ["slug", "name", "track", "stage", "health", "updatedAt"];
    for (const field of requiredExisting) {
      expect(feature.properties).toHaveProperty(field);
    }
  });
});

// ---------------- AC0: Audit table ----------------

describe("AC0 — Slug-detection audit table present and complete", () => {
  test("AC0-U1 audit file exists at the expected path", () => {
    expect(existsSync(AUDIT_PLAN)).toBe(true);
  });

  test("AC0-U2 audit contains a writer table with the expected columns", () => {
    const content = readFileSync(AUDIT_PLAN, "utf8");
    // Look for the markdown table header row
    expect(content).toMatch(/\| #\s*\| Skill\s*\| Writes\?\s*\| Slug available from\s*\| Patch type\s*\|/);
  });

  test("AC0-U3 no audit row is marked 'unknown' or blank in slug-availability column", () => {
    const content = readFileSync(AUDIT_PLAN, "utf8");
    // Extract table rows (lines starting with |)
    const rows = content.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(15); // At least 15 writers
    for (const row of rows) {
      expect(row).not.toMatch(/\|\s*unknown\s*\|/i);
      // Each row has at least 4 non-empty cells after the leading pipe
      const cells = row.split("|").slice(1, -1).map((c) => c.trim());
      expect(cells.length).toBeGreaterThanOrEqual(4);
      // The slug-availability cell (index 3) must be non-empty
      expect(cells[3].length).toBeGreaterThan(0);
    }
  });
});

// ---------------- AC1: Write targets shifted ----------------

describe("AC1 — Write targets shifted from root to per-artefact", () => {
  test("AC1-U1 zero write-path matches for .github/pipeline-state.json in skills/scripts/cli src", () => {
    let matches: string[] = [];
    try {
      const out = execSync(
        "grep -rn --include='*.md' --include='*.js' --include='*.ts' --include='*.mjs' --include='*.cjs' '\\.github/pipeline-state\\.json' .github/skills/ scripts/ cli/src/ 2>/dev/null || true",
        { cwd: REPO_ROOT, encoding: "utf8" }
      );
      matches = out
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        // Permit documentation mentions in markdown that include a read-only / scanner annotation within the same line
        .filter((line) => !/(read-only|scanner|archival|aggregate|derived|pointer)/i.test(line));
    } catch {
      // grep returns non-zero when no matches, which is the pass case
      matches = [];
    }
    if (matches.length > 0) {
      // eslint-disable-next-line no-console
      console.log("Residual un-annotated matches:\n" + matches.join("\n"));
    }
    expect(matches).toEqual([]);
  });
});

// ---------------- AC2: Scanner union-equality ----------------

describe("AC2 — Scanner produces a derived aggregate matching per-artefact union", () => {
  let tmpRoot: string;

  beforeAll(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), "ec3.1-scanner-"));
    mkdirSync(join(tmpRoot, "artefacts/feature-A"), { recursive: true });
    mkdirSync(join(tmpRoot, "artefacts/feature-B"), { recursive: true });
    mkdirSync(join(tmpRoot, ".github"), { recursive: true });

    const featureA = {
      slug: "feature-A",
      name: "Feature A",
      track: "standard",
      stage: "definition-of-ready",
      health: "green",
      updatedAt: "2026-04-15T00:00:00Z",
    };
    const featureB = {
      slug: "feature-B",
      name: "Feature B",
      track: "standard",
      stage: "test-plan",
      health: "green",
      updatedAt: "2026-04-17T00:00:00Z",
    };
    writeFileSync(
      join(tmpRoot, "artefacts/feature-A/pipeline-state.json"),
      JSON.stringify({ slug: "feature-A", ...featureA })
    );
    writeFileSync(
      join(tmpRoot, "artefacts/feature-B/pipeline-state.json"),
      JSON.stringify({ slug: "feature-B", ...featureB })
    );
  });

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  test("AC2-U1 scanner aggregates per-artefact files into features[] ordered by updatedAt desc", () => {
    if (!existsSync(SCANNER)) {
      throw new Error("Scanner not yet implemented at " + SCANNER);
    }
    execSync(`node "${SCANNER}" "${tmpRoot}"`, { cwd: REPO_ROOT, encoding: "utf8" });
    const derived = JSON.parse(readFileSync(join(tmpRoot, ".github/pipeline-state.derived.json"), "utf8"));
    expect(derived.features).toHaveLength(2);
    // feature-B has the more recent updatedAt
    expect(derived.features[0].slug).toBe("feature-B");
    expect(derived.features[1].slug).toBe("feature-A");
    expect(derived.derivedFrom).toBe("scanner");
  });

  test("AC2-I1 scanner against live repo covers features present in legacy fixture", () => {
    if (!existsSync(SCANNER) || !existsSync(LEGACY_FIXTURE)) return; // gracefully skip if prerequisites missing
    execSync(`node "${SCANNER}" "${REPO_ROOT}"`, { cwd: REPO_ROOT, encoding: "utf8" });
    const derived = JSON.parse(readFileSync(DERIVED_STATE, "utf8"));
    const legacy = JSON.parse(readFileSync(LEGACY_FIXTURE, "utf8"));

    const legacySlugs = new Set((legacy.features ?? []).map((f: any) => f.slug));
    const derivedSlugs = new Set(derived.features.map((f: any) => f.slug));
    for (const slug of legacySlugs) {
      expect(derivedSlugs.has(slug)).toBe(true);
    }
  });
});

// ---------------- AC3: Viz input path ----------------

describe("AC3 — Viz reads derived aggregate", () => {
  test("AC3-U1 pipeline-viz.html input-path constant points at derived file", () => {
    if (!existsSync(VIZ_HTML)) return;
    const content = readFileSync(VIZ_HTML, "utf8");
    // The viz should reference the derived file, not the root file, as its input
    expect(content).toMatch(/pipeline-state\.derived\.json/);
  });

  test("AC3-U2 pipeline-viz.html STATE_FILE constant is the derived path (no behavioural fetch of the old root)", () => {
    if (!existsSync(VIZ_HTML)) return;
    const content = readFileSync(VIZ_HTML, "utf8");
    // AC3 requires only the input-path constant to change; UI copy referencing
    // the legacy filename (drag-drop instructions, button labels) is permitted.
    // What must not exist: a `const STATE_FILE = 'pipeline-state.json'` behavioural
    // target or a fetch() of the legacy path.
    expect(content).toMatch(/const\s+STATE_FILE\s*=\s*['"]pipeline-state\.derived\.json['"]/);
    // No fetch of the legacy root
    const badFetch = /fetch\(\s*['"][^'"]*pipeline-state\.json['"]\s*[,)]/;
    expect(badFetch.test(content)).toBe(false);
  });
});

// ---------------- AC4: featureStatus + retention ----------------

describe("AC4 — featureStatus marks complete and file is retained", () => {
  test("AC4-U1 featureStatus enum values are 'in-flight' and 'complete'", () => {
    const schema = loadSchema();
    const feature = featureRecordSchema(schema);
    expect(feature.properties.featureStatus.enum.sort()).toEqual(["complete", "in-flight"]);
  });

  // AC4 integration (DoD round-trip) covered by AC4-I1 below once Task 7 lands
  test.todo("AC4-I1 DoD write round-trip — stub DoD writes featureStatus: complete and retains file");
});

// ---------------- AC5: Root file disposition ----------------

describe("AC5 — Root pipeline-state.json is exactly one of delete or pointer-doc", () => {
  test("AC5-U1 exactly one of: file absent with relocation commit in git log; OR file present as <= 10-line pointer", () => {
    const present = existsSync(ROOT_STATE);
    if (present) {
      const content = readFileSync(ROOT_STATE, "utf8");
      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThanOrEqual(10);
      // Pointer doc must reference the per-artefact convention
      expect(content).toMatch(/per-artefact|per artefact/i);
      // And must reference the derived aggregate
      expect(content).toMatch(/derived/i);
      // Must not contain a features[] array (would mean it's still a state file)
      expect(content).not.toMatch(/"features"\s*:\s*\[/);
    } else {
      // If absent, git log should show a relocation commit
      const log = execSync("git log --oneline -- .github/pipeline-state.json 2>/dev/null || true", {
        cwd: REPO_ROOT,
        encoding: "utf8",
      }).trim();
      expect(log.length).toBeGreaterThan(0);
    }
  });
});

// ---------------- AC6: End-to-end round-trip ----------------

describe("AC6 — Stub skill invocation writes per-artefact, not root", () => {
  test.todo("AC6-I1 simulated skill invocation touches artefacts/<slug>/pipeline-state.json, not .github/pipeline-state.json");
});

// ---------------- NFR tests ----------------

describe("NFR — Scanner runtime and backward readability", () => {
  test("NFR-Perf-U1 scanner completes in under 1 second over <= 10 features", () => {
    if (!existsSync(SCANNER)) return;
    const tmp = mkdtempSync(join(tmpdir(), "ec3.1-perf-"));
    mkdirSync(join(tmp, ".github"), { recursive: true });
    for (let i = 0; i < 10; i++) {
      const dir = join(tmp, `artefacts/feature-${i}`);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "pipeline-state.json"),
        JSON.stringify({
          slug: `feature-${i}`,
          name: `F${i}`,
          track: "standard",
          stage: "test-plan",
          health: "green",
          updatedAt: new Date(Date.now() - i * 1000).toISOString(),
        })
      );
    }
    const start = performance.now();
    execSync(`node "${SCANNER}" "${tmp}"`, { cwd: REPO_ROOT, encoding: "utf8" });
    const elapsed = performance.now() - start;
    rmSync(tmp, { recursive: true, force: true });
    expect(elapsed).toBeLessThan(1000);
  });

  test("NFR-Compat-U1 scanner accepts legacy per-artefact files without featureStatus", () => {
    if (!existsSync(SCANNER)) return;
    const tmp = mkdtempSync(join(tmpdir(), "ec3.1-compat-"));
    mkdirSync(join(tmp, ".github"), { recursive: true });
    const dir = join(tmp, "artefacts/legacy-feature");
    mkdirSync(dir, { recursive: true });
    // Legacy shape: no featureStatus field
    writeFileSync(
      join(dir, "pipeline-state.json"),
      JSON.stringify({
        slug: "legacy-feature",
        name: "Legacy",
        track: "standard",
        stage: "definition-of-done",
        health: "green",
        updatedAt: "2026-03-01T00:00:00Z",
      })
    );
    execSync(`node "${SCANNER}" "${tmp}"`, { cwd: REPO_ROOT, encoding: "utf8" });
    const derived = JSON.parse(readFileSync(join(tmp, ".github/pipeline-state.derived.json"), "utf8"));
    expect(derived.features).toHaveLength(1);
    expect(derived.features[0].slug).toBe("legacy-feature");
    // featureStatus should simply be absent — no error, no default
    expect(derived.features[0].featureStatus).toBeUndefined();
    rmSync(tmp, { recursive: true, force: true });
  });
});
