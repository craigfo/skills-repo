import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import yaml from "js-yaml";
import { workflowPath, statePath, artefactsPath, skillsPath } from "./paths.js";

export interface WorkflowStep {
  step: string;
  skill?: string;
  produces?: string;
  requires?: string[];
  external?: boolean;
}

export interface Workflow {
  version: number;
  preset?: string;
  unit?: string;
  steps: WorkflowStep[];
}

export interface WorkflowWarning {
  code: "missing-requires" | "unknown-skill" | "duplicate-step";
  step: string;
  message: string;
}

/**
 * story-unit-min preset — real workflow body written into workflow.yaml at
 * init time when --preset=story-unit-min (or default) is selected.
 *
 * Each non-external step expects the operator to produce the named file
 * under artefacts/<slug>/; external steps progress via `mark-step-done`.
 */
export const STORY_UNIT_MIN_WORKFLOW_YAML = `# Productisation MVP workflow — story-unit-min preset.
version: 1
preset: story-unit-min
unit: story
steps:
  - step: definition
    skill: definition
    produces: definition.md
  - step: test-plan
    skill: test-plan
    produces: test-plan.md
    requires: [definition]
  - step: definition-of-ready
    skill: definition-of-ready
    produces: dor.md
    requires: [test-plan]
  - step: implement
    external: true
    requires: [definition-of-ready]
  - step: definition-of-done
    skill: definition-of-done
    produces: dod.md
    requires: [implement]
`;

export function parseWorkflow(yamlBody: string): Workflow {
  const parsed = yaml.load(yamlBody) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("workflow.yaml is not an object");
  }
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.steps)) {
    throw new Error("workflow.yaml: steps must be an array");
  }
  return {
    version: typeof obj.version === "number" ? obj.version : 1,
    preset: typeof obj.preset === "string" ? obj.preset : undefined,
    unit: typeof obj.unit === "string" ? obj.unit : undefined,
    steps: obj.steps.map((s) => s as WorkflowStep),
  };
}

export function readWorkflow(cwd: string): Workflow {
  return parseWorkflow(readFileSync(workflowPath(cwd), "utf8"));
}

export function validateWorkflow(wf: Workflow): WorkflowWarning[] {
  const warnings: WorkflowWarning[] = [];
  const ids = new Set<string>();
  for (const s of wf.steps) {
    if (ids.has(s.step)) {
      warnings.push({
        code: "duplicate-step",
        step: s.step,
        message: `duplicate step id '${s.step}'`,
      });
    }
    ids.add(s.step);
  }
  for (const s of wf.steps) {
    for (const r of s.requires ?? []) {
      if (!ids.has(r)) {
        warnings.push({
          code: "missing-requires",
          step: s.step,
          message: `step '${s.step}' requires '${r}' which is not defined`,
        });
      }
    }
  }
  return warnings;
}

// --- State (mark-step-done, active slug) -------------------------------

export interface PipelineState {
  activeSlug: string;
  lastActivity?: string; // ISO-8601
  marks: Record<string, string>; // step name → ISO-8601 timestamp
}

const STATE_JSON = "pipeline.json";

export function statePipelinePath(cwd: string): string {
  return join(statePath(cwd), STATE_JSON);
}

export function readState(cwd: string): PipelineState {
  const p = statePipelinePath(cwd);
  if (!existsSync(p)) return { activeSlug: "default", marks: {} };
  try {
    const obj = JSON.parse(readFileSync(p, "utf8")) as PipelineState;
    if (!obj.marks) obj.marks = {};
    if (!obj.activeSlug) obj.activeSlug = "default";
    return obj;
  } catch {
    return { activeSlug: "default", marks: {} };
  }
}

export function writeState(cwd: string, state: PipelineState): void {
  const p = statePipelinePath(cwd);
  mkdirSync(dirname(p), { recursive: true });
  const tmp = p + ".tmp";
  state.lastActivity = new Date().toISOString();
  writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n", "utf8");
  renameSync(tmp, p); // atomic on POSIX / NTFS
}

// --- Resolver ---------------------------------------------------------

export interface ResolveContext {
  cwd: string;
  slug: string;
  workflow: Workflow;
  state: PipelineState;
}

export function stepIsSatisfied(ctx: ResolveContext, step: WorkflowStep): boolean {
  if (step.external) return Boolean(ctx.state.marks[step.step]);
  if (!step.produces) return Boolean(ctx.state.marks[step.step]);
  return existsSync(join(artefactsPath(ctx.cwd), ctx.slug, step.produces));
}

export function resolveNextStep(ctx: ResolveContext): WorkflowStep | null {
  for (const step of ctx.workflow.steps) {
    const requires = step.requires ?? [];
    const prereqsMet = requires.every((r) => {
      const prior = ctx.workflow.steps.find((s) => s.step === r);
      if (!prior) return true; // validate() flags; resolver doesn't block
      return stepIsSatisfied(ctx, prior);
    });
    if (prereqsMet && !stepIsSatisfied(ctx, step)) return step;
  }
  return null;
}

// --- Skill loader ------------------------------------------------------

export function loadSkillBody(cwd: string, skillId: string): string {
  const p = join(skillsPath(cwd), skillId, "SKILL.md");
  if (!existsSync(p)) throw new Error(`skill '${skillId}' not resolved at ${p}`);
  return readFileSync(p, "utf8");
}
