import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, readFileSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { runInit } from "../src/commands/init.js";
import { runStatus } from "../src/commands/status.js";
import { runArtefact } from "../src/commands/artefact.js";
import { runNext } from "../src/commands/run.js";
import { mkTmpRepo, rmrf, exists, readText } from "./helpers.js";
import { mkFixtureRepo } from "./fetch-helpers.js";

function fixture() {
  return {
    "skills/definition.md": "# definition\n",
    "skills/test-plan.md": "# tp\n",
    "skills/definition-of-ready.md": "# dor\n",
    "skills/definition-of-done.md": "# dod\n",
    "standards/core.md": "# core\n",
  };
}

describe("ps3.2: status + artefact new", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  async function initSourced(dest: string) {
    const fx = mkFixtureRepo({ files: fixture(), tag: "v0.0.1" });
    cleanup.push(fx.dir);
    await runInit({ cwd: dest, yes: true, source: fx.url, ref: fx.ref });
    return fx;
  }

  it("AC1: status on fresh sidecar (no artefact) reports no active feature", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const res = await runStatus({ cwd: dest });
    expect(res.exitCode).toBe(0);
    const output = res.stdout.join("\n");
    expect(output).toContain("active feature:");
    expect(output).toContain("artefact new");
    expect(output).toContain("workflow preset:  story-unit-min");
  });

  it("AC2: status reports correct next step after partial progress", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    await runArtefact({ cwd: dest, subcommand: "new", slug: "my-feature" });
    await runNext({ cwd: dest }); // scaffolds definition.md
    // Operator "completes" definition: treat file as authored
    writeFileSync(join(dest, "artefacts", "my-feature", "definition.md"), "# done\n");
    const res = await runStatus({ cwd: dest });
    expect(res.exitCode).toBe(0);
    expect(res.stdout.join("\n")).toContain("next step:        test-plan");
  });

  it("AC3: artefact new scaffolds the feature folder and marks it active", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const res = await runArtefact({ cwd: dest, subcommand: "new", slug: "my-feature" });
    expect(res.exitCode).toBe(0);
    expect(exists(join(dest, "artefacts", "my-feature", "reference"))).toBe(true);
    const state = JSON.parse(
      readText(join(dest, ".skills-repo", "state", "pipeline.json")),
    );
    expect(state.activeSlug).toBe("my-feature");
  });

  it("AC4: artefact new refuses an existing slug", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    mkdirSync(join(dest, "artefacts", "dup"), { recursive: true });
    const res = await runArtefact({ cwd: dest, subcommand: "new", slug: "dup" });
    expect(res.exitCode).not.toBe(0);
    expect(res.stderr.join("\n")).toContain("already exists");
  });

  it("AC5: status surfaces blocking issue (hash mismatch) with exit 1", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    // tamper
    const target = join(dest, ".skills-repo", "skills", "definition", "SKILL.md");
    writeFileSync(target, readText(target) + "\n// tampered\n");
    const res = await runStatus({ cwd: dest });
    expect(res.exitCode).toBe(1);
    expect(res.stdout.join("\n")).toContain("blocking:");
    expect(res.stdout.join("\n")).toContain("hash mismatch");
  });

  it("AC6: status includes last-activity after state write", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    await runArtefact({ cwd: dest, subcommand: "new", slug: "x" });
    const res = await runStatus({ cwd: dest });
    expect(res.stdout.join("\n")).toMatch(/last activity:\s+\d{4}-\d{2}-\d{2}T/);
  });

  it("status is read-only — no files under .skills-repo/skills/ or /standards/ mutate", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const before = readText(join(dest, ".skills-repo", "skills", "definition", "SKILL.md"));
    await runStatus({ cwd: dest });
    const after = readText(join(dest, ".skills-repo", "skills", "definition", "SKILL.md"));
    expect(after).toBe(before);
  });

  it("missing lockfile shows as blocking in status (exit 1)", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    unlinkSync(join(dest, ".skills-repo", "lock.json"));
    const res = await runStatus({ cwd: dest });
    expect(res.exitCode).toBe(1);
    expect(res.stdout.join("\n")).toContain("lock.json missing");
  });
});
