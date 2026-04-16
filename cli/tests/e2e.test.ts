import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { mkTmpRepo, rmrf, exists, gitStatusPorcelain } from "./helpers.js";

const BIN = join(__dirname, "..", "bin", "skills-repo.mjs");

describe("e2e: spawn CLI binary", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("init --yes then run next produces an artefact and keeps the tree clean (AC1+AC3+AC5)", () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    execFileSync("node", [BIN, "init", "--yes"], { cwd: dir, stdio: "pipe" });
    execFileSync("node", [BIN, "run", "next"], { cwd: dir, stdio: "pipe" });
    expect(exists(join(dir, "artefacts", "default", "hello.md"))).toBe(true);
    const status = gitStatusPorcelain(dir);
    for (const line of status) {
      expect(line).toMatch(/^\?\?\s(\.skills-repo|artefacts|\.gitignore)/);
    }
  });

  it("init aborts non-zero in a non-git directory (AC4)", () => {
    const dir = mkTmpRepo(false);
    cleanup.push(dir);
    let exitCode = 0;
    try {
      execFileSync("node", [BIN, "init", "--yes"], { cwd: dir, stdio: "pipe" });
    } catch (e: unknown) {
      const err = e as { status?: number };
      exitCode = err.status ?? -1;
    }
    expect(exitCode).not.toBe(0);
    expect(exists(join(dir, ".skills-repo"))).toBe(false);
  });
});
