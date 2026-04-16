import { describe, it, expect, afterEach } from "vitest";
import { join } from "node:path";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { runInit } from "../src/commands/init.js";
import { runNext } from "../src/commands/run.js";
import { readLockFile, verifyAgainstLock, sha256Path } from "../src/engine/lock.js";
import { STORY_UNIT_MIN } from "../src/engine/preset.js";
import { mkTmpRepo, rmrf, readText } from "./helpers.js";
import { mkFixtureRepo } from "./fetch-helpers.js";

function mvpFixture() {
  return {
    "skills/definition.md": "# definition\nA\n",
    "skills/test-plan.md": "# test-plan\nB\n",
    "skills/definition-of-ready.md": "# dor\nC\n",
    "skills/definition-of-done.md": "# dod\nD\n",
    "standards/core.md": "# core\nE\n",
  };
}

describe("ps2.2: lockfile pinning and verification", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  async function initSourced(dest: string) {
    const fixture = mkFixtureRepo({ files: mvpFixture(), tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).toBe(0);
    return fixture;
  }

  it("AC1: init writes lock.json with expected shape", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const lock = readLockFile(dest);
    expect(lock).not.toBeNull();
    expect(lock!.version).toBe(1);
    expect(lock!.hashAlgorithm).toBe("sha256");
    expect(lock!.engineVersion).toMatch(/^\d+\.\d+/);
    expect(lock!.source.refKind).toBe("tag");
    expect(lock!.files.length).toBe(STORY_UNIT_MIN.mappings.length);
    for (const entry of lock!.files) {
      expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("AC2: run verifies all files before execution (pass path)", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0);
    const today = new Date().toISOString().slice(0, 10);
    const trace = readText(join(dest, ".skills-repo", "traces", `${today}.jsonl`));
    expect(trace).toContain('"type":"verify"');
    expect(trace).toContain('"status":"ok"');
  });

  it("AC3: tampered file blocks run with exit 5 and mismatch error", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const target = join(dest, ".skills-repo", "skills", "definition", "SKILL.md");
    writeFileSync(target, readText(target) + "\n// tampered\n");
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(5);
    expect(res.stderr.join("\n")).toContain("hash mismatch");
    expect(res.stderr.join("\n")).toContain("skills/definition/SKILL.md");
    const verdict = verifyAgainstLock(dest);
    expect(verdict.result).toBe("mismatch");
  });

  it("AC4: missing file blocks run with exit 4", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    unlinkSync(join(dest, ".skills-repo", "standards", "software-engineering", "core.md"));
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(4);
    expect(res.stderr.join("\n")).toContain("missing on disk");
    expect(res.stderr.join("\n")).toContain("standards/software-engineering/core.md");
  });

  it("AC5: branch refKind emits verify WARN and still passes", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const fixture = mkFixtureRepo({ files: mvpFixture(), branch: "main" });
    cleanup.push(fixture.dir);
    const init = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(init.exitCode).toBe(0);
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0);
    expect(res.stderr.join("\n")).toMatch(/WARN.*branch ref/);
  });

  it("AC6: missing lock.json (in sourced mode) blocks run with exit 3", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    unlinkSync(join(dest, ".skills-repo", "lock.json"));
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(3);
  });

  it("skeleton mode (no source) still runs without lockfile verification", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const init = await runInit({ cwd: dest, yes: true });
    expect(init.exitCode).toBe(0);
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0); // placeholder lockfile with no source → no verification
  });

  it("lockfile entries are sorted for determinism", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const lock = readLockFile(dest)!;
    const paths = lock.files.map((e) => e.path);
    const sorted = [...paths].sort();
    expect(paths).toEqual(sorted);
  });

  it("sha256 in lockfile equals sha256 of the file on disk", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest);
    const lock = readLockFile(dest)!;
    for (const entry of lock.files) {
      const actual = sha256Path(join(dest, ".skills-repo", entry.path));
      expect(actual).toBe(entry.sha256);
    }
  });
});
