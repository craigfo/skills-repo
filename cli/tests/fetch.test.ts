import { describe, it, expect, afterEach } from "vitest";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { runInit } from "../src/commands/init.js";
import { STORY_UNIT_MIN } from "../src/engine/preset.js";
import { mkTmpRepo, rmrf, exists, readText } from "./helpers.js";
import { mkFixtureRepo } from "./fetch-helpers.js";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function mvpFixtureContent(): Record<string, string> {
  const body: Record<string, string> = {};
  // Content must exactly match preset mapping `from` paths.
  body["skills/definition.md"] = "# definition\nBody line 1\n";
  body["skills/test-plan.md"] = "# test-plan\nBody line 2\n";
  body["skills/definition-of-ready.md"] = "# definition-of-ready\nBody line 3\n";
  body["skills/definition-of-done.md"] = "# definition-of-done\nBody line 4\n";
  body["standards/core.md"] = "# core\nStandards body\n";
  return body;
}

describe("ps2.1: fetch from configurable source", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("AC1: init --source --ref fetches preset files into .skills-repo/", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const fixture = mkFixtureRepo({ files: mvpFixtureContent(), tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).toBe(0);
    for (const m of STORY_UNIT_MIN.mappings) {
      expect(exists(join(dest, ".skills-repo", m.to))).toBe(true);
    }
    // profile.yaml records source
    const profile = readText(join(dest, ".skills-repo", "profile.yaml"));
    expect(profile).toContain(`url: ${fixture.url}`);
    expect(profile).toContain("ref: v0.0.1");
    expect(profile).toContain("refKind: tag");
  });

  it("AC2: fetched files are byte-identical to source (SHA-256 match)", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const content = mvpFixtureContent();
    const fixture = mkFixtureRepo({ files: content, tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).toBe(0);
    for (const m of STORY_UNIT_MIN.mappings) {
      const written = readFileSync(join(dest, ".skills-repo", m.to));
      const expected = Buffer.from(content[m.from], "utf8");
      expect(sha256(written)).toBe(sha256(expected));
    }
  });

  it("AC3: branch ref emits WARN and proceeds", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const fixture = mkFixtureRepo({ files: mvpFixtureContent(), branch: "main" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).toBe(0);
    const stderr = res.stderr.join("\n");
    expect(stderr).toMatch(/WARN:/);
    expect(stderr).toMatch(/branch ref/);
    expect(stderr).toMatch(/main/);
  });

  it("AC4: unreachable source exits non-zero with clean state", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const res = await runInit({
      cwd: dest,
      yes: true,
      source: "file:///nonexistent/path/to/repo.git",
      ref: "v0.0.1",
    });
    expect(res.exitCode).not.toBe(0);
    // skills/ and standards/ should not be populated
    expect(exists(join(dest, ".skills-repo", "skills", "definition", "SKILL.md"))).toBe(false);
    expect(exists(join(dest, ".skills-repo", "standards", "software-engineering", "core.md"))).toBe(false);
  });

  it("AC5: --source and --ref override when passed", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const fixture = mkFixtureRepo({ files: mvpFixtureContent(), tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).toBe(0);
    const profile = readText(join(dest, ".skills-repo", "profile.yaml"));
    expect(profile).toContain(fixture.url);
    expect(profile).toContain("v0.0.1");
  });

  it("writes a 'fetch' trace entry", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    const fixture = mkFixtureRepo({ files: mvpFixtureContent(), tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    const today = new Date().toISOString().slice(0, 10);
    const trace = readText(join(dest, ".skills-repo", "traces", `${today}.jsonl`));
    expect(trace).toContain('"type":"fetch"');
    expect(trace).toContain('"status":"ok"');
  });

  it("rolls back partial writes if a mapped source file is missing", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    // omit one of the required files from the fixture
    const partial = mvpFixtureContent();
    delete partial["standards/core.md"];
    const fixture = mkFixtureRepo({ files: partial, tag: "v0.0.1" });
    cleanup.push(fixture.dir);
    const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
    expect(res.exitCode).not.toBe(0);
    expect(exists(join(dest, ".skills-repo", "skills", "definition", "SKILL.md"))).toBe(false);
    expect(exists(join(dest, ".skills-repo", "standards"))).toBe(false);
  });
});
