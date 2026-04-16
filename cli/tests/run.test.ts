import { describe, it, expect, afterEach } from "vitest";
import { join } from "node:path";
import { runInit } from "../src/commands/init.js";
import { runNext } from "../src/commands/run.js";
import { mkTmpRepo, rmrf, exists, readText, gitStatusPorcelain } from "./helpers.js";

describe("run next command", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("AC3: executes the trivial skill and writes one artefact", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    await runInit({ cwd: dir, yes: true });
    const res = await runNext({ cwd: dir });
    expect(res.exitCode).toBe(0);
    const artefact = join(dir, "artefacts", "default", "hello.md");
    expect(exists(artefact)).toBe(true);
    const body = readText(artefact);
    expect(body).toContain("Hello from skills-repo");
  });

  it("AC5: git status after full cycle shows only approved paths", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    await runInit({ cwd: dir, yes: true });
    await runNext({ cwd: dir });
    const status = gitStatusPorcelain(dir);
    for (const line of status) {
      expect(line).toMatch(/^\?\?\s(\.skills-repo|artefacts|\.gitignore)/);
    }
  });

  it("errors clearly if sidecar is not initialised", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    const res = await runNext({ cwd: dir });
    expect(res.exitCode).not.toBe(0);
    expect(res.stderr.join("\n")).toMatch(/sidecar not initialised/);
  });

  it("writes a 'run.step' trace entry", async () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    await runInit({ cwd: dir, yes: true });
    await runNext({ cwd: dir });
    const today = new Date().toISOString().slice(0, 10);
    const trace = readText(join(dir, ".skills-repo", "traces", `${today}.jsonl`));
    expect(trace).toContain('"type":"run.step"');
    expect(trace).toContain('"skill":"trivial"');
  });
});
