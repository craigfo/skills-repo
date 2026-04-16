import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { runInit } from "../src/commands/init.js";
import { runNext } from "../src/commands/run.js";
import { runArtefact } from "../src/commands/artefact.js";
import {
  parseWorkflow,
  validateWorkflow,
  STORY_UNIT_MIN_WORKFLOW_YAML,
} from "../src/engine/workflow.js";
import { mkTmpRepo, rmrf, exists, readText } from "./helpers.js";
import { mkFixtureRepo } from "./fetch-helpers.js";

function mvpFixture() {
  return {
    "skills/definition.md": "# skill: definition\nDrive discovery.\n",
    "skills/test-plan.md": "# skill: test-plan\nWrite failing tests.\n",
    "skills/definition-of-ready.md": "# skill: dor\nGate check.\n",
    "skills/definition-of-done.md": "# skill: dod\nPost-merge check.\n",
    "standards/core.md": "# core standards\n",
  };
}

async function initSourced(dest: string, cleanup: string[]) {
  const fixture = mkFixtureRepo({ files: mvpFixture(), tag: "v0.0.1" });
  cleanup.push(fixture.dir);
  const res = await runInit({ cwd: dest, yes: true, source: fixture.url, ref: fixture.ref });
  expect(res.exitCode).toBe(0);
  return fixture;
}

describe("ps3.1: workflow schema + preset + resolver", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("AC1: story-unit-min preset passes schema and has 5 steps", () => {
    const wf = parseWorkflow(STORY_UNIT_MIN_WORKFLOW_YAML);
    expect(wf.version).toBe(1);
    expect(wf.preset).toBe("story-unit-min");
    expect(wf.steps.length).toBe(5);
    const names = wf.steps.map((s) => s.step);
    expect(names).toEqual([
      "definition",
      "test-plan",
      "definition-of-ready",
      "implement",
      "definition-of-done",
    ]);
    expect(wf.steps.find((s) => s.step === "implement")!.external).toBe(true);
    const warnings = validateWorkflow(wf);
    expect(warnings).toEqual([]);
  });

  it("AC2: run next resolves the first satisfied step (definition) and scaffolds its produces file", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0);
    const produced = join(dest, "artefacts", "default", "definition.md");
    expect(exists(produced)).toBe(true);
    const body = readText(produced);
    expect(body).toContain("# definition");
    expect(body).toContain("skill: definition");
  });

  it("AC3: run next skips completed steps and moves to test-plan", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    await runNext({ cwd: dest }); // scaffolds definition.md
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0);
    expect(exists(join(dest, "artefacts", "default", "test-plan.md"))).toBe(true);
  });

  it("AC4: external step exits 2; mark-step-done advances to the next step", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    // fast-forward to the external step by creating the prior produces files
    const slugDir = join(dest, "artefacts", "default");
    mkdirSync(slugDir, { recursive: true });
    writeFileSync(join(slugDir, "definition.md"), "stub\n");
    writeFileSync(join(slugDir, "test-plan.md"), "stub\n");
    writeFileSync(join(slugDir, "dor.md"), "stub\n");

    const ext = await runNext({ cwd: dest });
    expect(ext.exitCode).toBe(2);
    expect(ext.stdout.join("\n")).toContain("external step 'implement'");
    expect(exists(join(slugDir, "dod.md"))).toBe(false);

    const mark = await runArtefact({
      cwd: dest,
      slug: "default",
      subcommand: "mark-step-done",
      step: "implement",
    });
    expect(mark.exitCode).toBe(0);

    const advance = await runNext({ cwd: dest });
    expect(advance.exitCode).toBe(0);
    expect(exists(join(slugDir, "dod.md"))).toBe(true);
  });

  it("AC5: invalid workflow.yaml composition emits WARN and does not block execution", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    // Hand-edit the workflow to introduce a missing-requires reference
    const workflowP = join(dest, ".skills-repo", "workflow.yaml");
    const body = readFileSync(workflowP, "utf8") + "\n  - step: orphan\n    skill: definition\n    produces: orphan.md\n    requires: [nonexistent-step]\n";
    writeFileSync(workflowP, body, "utf8");
    const res = await runNext({ cwd: dest });
    const stderr = res.stderr.join("\n");
    expect(stderr).toContain("WARN: workflow composition");
    expect(stderr).toContain("nonexistent-step");
    expect(res.exitCode).toBe(0); // does not block
  });

  it("AC6: state writes are atomic (rename-from-tmp pattern)", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    await runNext({ cwd: dest }); // writes state (definition scaffolded + state updated)
    const statePath = join(dest, ".skills-repo", "state", "pipeline.json");
    expect(exists(statePath)).toBe(true);
    const state = JSON.parse(readText(statePath));
    expect(state.activeSlug).toBe("default");
    expect(state.lastActivity).toMatch(/\d{4}-\d{2}-\d{2}T/);
    // No .tmp file should leak
    expect(exists(statePath + ".tmp")).toBe(false);
  });

  it("writes a run.step trace entry and skips completion cleanly", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    await runNext({ cwd: dest });
    const today = new Date().toISOString().slice(0, 10);
    const trace = readText(join(dest, ".skills-repo", "traces", `${today}.jsonl`));
    expect(trace).toContain('"type":"run.step"');
    expect(trace).toContain('"step":"definition"');
  });

  it("returns workflow-complete when all steps are done", async () => {
    const dest = mkTmpRepo(true);
    cleanup.push(dest);
    await initSourced(dest, cleanup);
    const slugDir = join(dest, "artefacts", "default");
    mkdirSync(slugDir, { recursive: true });
    writeFileSync(join(slugDir, "definition.md"), "x");
    writeFileSync(join(slugDir, "test-plan.md"), "x");
    writeFileSync(join(slugDir, "dor.md"), "x");
    writeFileSync(join(slugDir, "dod.md"), "x");
    await runArtefact({
      cwd: dest,
      slug: "default",
      subcommand: "mark-step-done",
      step: "implement",
    });
    const res = await runNext({ cwd: dest });
    expect(res.exitCode).toBe(0);
    expect(res.stdout.join("\n")).toContain("workflow complete");
  });
});
