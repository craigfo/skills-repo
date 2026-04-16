import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { isSidecarInitialised } from "../engine/sidecar.js";
import {
  readWorkflow,
  readState,
  resolveNextStep,
  statePipelinePath,
  validateWorkflow,
} from "../engine/workflow.js";
import { verifyAgainstLock } from "../engine/lock.js";
import { artefactsPath, sidecarPath } from "../engine/paths.js";
import { appendTrace } from "../engine/trace.js";

export interface StatusOptions {
  cwd: string;
}

export interface StatusResult {
  exitCode: number;
  stdout: string[];
  stderr: string[];
}

/**
 * `status` reports: active feature, workflow preset, current + next step,
 * and any blocking issue. Never writes to `.skills-repo/skills/` or
 * `.skills-repo/standards/`. Exit 1 on blocking issues, 0 otherwise.
 */
export async function runStatus(opts: StatusOptions): Promise<StatusResult> {
  const out: string[] = [];
  const err: string[] = [];
  if (!isSidecarInitialised(opts.cwd)) {
    err.push("sidecar not initialised — run `skills-repo init` first");
    return { exitCode: 1, stderr: err, stdout: out };
  }

  const verdict = verifyAgainstLock(opts.cwd);
  let blocking: string | null = null;
  if (verdict.result === "no-lockfile") blocking = "lock.json missing — run `skills-repo init`";
  else if (verdict.result === "missing-file")
    blocking = `lockfile declares '${verdict.path}' but file is missing — run \`skills-repo init\``;
  else if (verdict.result === "mismatch")
    blocking = `hash mismatch on ${verdict.mismatches.length} file(s) — run \`skills-repo init\` to refetch`;

  const state = readState(opts.cwd);
  const slug = state.activeSlug ?? "default";
  const activeLabel =
    state.activeSlug && existsSync(join(artefactsPath(opts.cwd), state.activeSlug))
      ? slug
      : "none — run `skills-repo artefact new <slug>`";

  let preset = "skeleton";
  let currentStep = "—";
  let nextStep = "—";
  let composition: string[] = [];
  try {
    const workflow = readWorkflow(opts.cwd);
    preset = workflow.preset ?? workflow.unit ?? "skeleton";
    for (const w of validateWorkflow(workflow)) composition.push(w.message);
    const next = resolveNextStep({ cwd: opts.cwd, slug, workflow, state });
    nextStep = next ? next.step + (next.external ? " (external)" : "") : "— (workflow complete)";
    // current = last step that produced a file
    for (const s of workflow.steps) {
      if (s.produces && existsSync(join(artefactsPath(opts.cwd), slug, s.produces))) {
        currentStep = s.step;
      }
      if (s.external && state.marks[s.step]) currentStep = s.step;
    }
  } catch (e) {
    err.push(`workflow.yaml unreadable: ${(e as Error).message}`);
  }

  out.push(`active feature:   ${activeLabel}`);
  out.push(`workflow preset:  ${preset}`);
  out.push(`current step:     ${currentStep}`);
  out.push(`next step:        ${nextStep}`);
  if (state.lastActivity) {
    out.push(`last activity:    ${state.lastActivity} (${describeAge(state.lastActivity)})`);
  } else if (existsSync(statePipelinePath(opts.cwd))) {
    const age = describeAge(statSync(statePipelinePath(opts.cwd)).mtime.toISOString());
    out.push(`last activity:    ${age} (fs mtime fallback)`);
  } else {
    out.push(`last activity:    — (no state writes yet)`);
  }
  for (const w of composition) out.push(`composition WARN: ${w}`);
  if (blocking) {
    out.push("");
    out.push(`blocking: ${blocking}`);
  }

  appendTrace(opts.cwd, {
    type: "status",
    status: blocking ? "blocked" : "ok",
    activeFeature: state.activeSlug,
    nextStep,
  });
  return { exitCode: blocking ? 1 : 0, stderr: err, stdout: out };
}

function describeAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export { sidecarPath }; // for tests
