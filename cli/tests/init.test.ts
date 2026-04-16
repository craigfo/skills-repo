import { describe, it, expect, afterEach } from "vitest";
import { join } from "node:path";
import { runInit } from "../src/commands/init.js";
import { mkTmpRepo, rmrf, exists, readText, gitStatusPorcelain, writeText } from "./helpers.js";

describe("init command", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("AC4: aborts non-zero when host is not a git repo", async () => {
    const dir = mkTmpRepo(false);
    cleanup.push(dir);
    const res = await runInit({ cwd: dir, yes: true });
    expect(res.exitCode).not.toBe(0);
    expect(res.stderr.join("\n")).toContain("not a git repository");
    expect(exists(join(dir, ".skills-repo"))).toBe(false);
    expect(exists(join(dir, "artefacts"))).toBe(false);
  });

  it("AC1: creates only .skills-repo/ and artefacts/ on a clean git repo", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    const res = await runInit({ cwd: dir, yes: true });
    expect(res.exitCode).toBe(0);
    expect(exists(join(dir, ".skills-repo"))).toBe(true);
    expect(exists(join(dir, ".skills-repo", "workflow.yaml"))).toBe(true);
    expect(exists(join(dir, ".skills-repo", "profile.yaml"))).toBe(true);
    expect(exists(join(dir, ".skills-repo", "lock.json"))).toBe(true);
    expect(exists(join(dir, ".skills-repo", "skills", "trivial", "SKILL.md"))).toBe(true);
    expect(exists(join(dir, "artefacts"))).toBe(true);
    // git status should show only the approved paths
    const status = gitStatusPorcelain(dir);
    for (const line of status) {
      expect(line).toMatch(/^\?\?\s(\.skills-repo|artefacts|\.gitignore)/);
    }
  });

  it("AC2: appends two lines to .gitignore when confirmed", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    const res = await runInit({ cwd: dir, yes: true });
    expect(res.exitCode).toBe(0);
    const gi = readText(join(dir, ".gitignore"));
    expect(gi).toContain(".skills-repo/state/");
    expect(gi).toContain(".skills-repo/cache/");
  });

  it("AC2: appends to an existing .gitignore without disturbing prior lines", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    writeText(join(dir, ".gitignore"), "node_modules\ndist\n");
    const res = await runInit({ cwd: dir, yes: true });
    expect(res.exitCode).toBe(0);
    const gi = readText(join(dir, ".gitignore"));
    expect(gi).toMatch(/^node_modules\ndist\n/);
    expect(gi).toContain(".skills-repo/state/");
    expect(gi).toContain(".skills-repo/cache/");
  });

  it("writes an 'init' trace entry", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    await runInit({ cwd: dir, yes: true });
    const today = new Date().toISOString().slice(0, 10);
    const trace = readText(join(dir, ".skills-repo", "traces", `${today}.jsonl`));
    expect(trace).toContain('"type":"init"');
    expect(trace).toContain('"status":"ok"');
  });
});
