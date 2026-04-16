import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { isSidecarInitialised } from "../engine/sidecar.js";
import { executeTrivialSkill, TRIVIAL_SKILL_ID } from "../engine/trivial-skill.js";
import { appendTrace } from "../engine/trace.js";
import { verifyAgainstLock, type LockMismatch } from "../engine/lock.js";
import {
  readWorkflow,
  validateWorkflow,
  resolveNextStep,
  readState,
  writeState,
  loadSkillBody,
} from "../engine/workflow.js";
import { artefactsPath } from "../engine/paths.js";

export interface RunOptions {
  cwd: string;
  slug?: string;
}

export interface RunResult {
  exitCode: number;
  stderr: string[];
  stdout: string[];
}

/**
 * `run next` — verify lockfile; resolve next workflow step; execute.
 *
 * Exit codes:
 *   0 — step executed (or no next step — workflow complete)
 *   1 — sidecar not initialised
 *   2 — next step is `external: true` — operator must run `artefact <slug> mark-step-done <step>`
 *   3 — lockfile missing (sourced mode)
 *   4 — a file named in the lockfile is missing from disk
 *   5 — hash mismatch
 */
export async function runNext(opts: RunOptions): Promise<RunResult> {
  const out: string[] = [];
  const err: string[] = [];
  if (!isSidecarInitialised(opts.cwd)) {
    err.push("sidecar not initialised — run `skills-repo init` first");
    return { exitCode: 1, stderr: err, stdout: out };
  }

  // 1. Verify lockfile.
  const verdict = verifyAgainstLock(opts.cwd);
  if (verdict.result === "no-lockfile") {
    err.push("lock.json is missing — run `skills-repo init` to refetch");
    appendTrace(opts.cwd, { type: "verify", status: "fail", reason: "no-lockfile" });
    return { exitCode: verdict.exitCode, stderr: err, stdout: out };
  } else if (verdict.result === "skeleton-mode") {
    // ps1.1 skeleton — fall through to the legacy trivial-skill path.
    return runSkeleton(opts, out, err);
  } else if (verdict.result === "missing-file") {
    err.push(
      `lockfile declares '${verdict.path}' but it is missing on disk; run 'skills-repo init' to refetch`,
    );
    appendTrace(opts.cwd, {
      type: "verify",
      status: "fail",
      reason: "missing-file",
      path: verdict.path,
    });
    return { exitCode: verdict.exitCode, stderr: err, stdout: out };
  } else if (verdict.result === "mismatch") {
    const mm = verdict.mismatches
      .map(
        (m: LockMismatch) =>
          `  ${m.path}\n    expected: ${m.expected}\n    actual:   ${m.actual}`,
      )
      .join("\n");
    err.push(`hash mismatch — ${verdict.mismatches.length} file(s):\n${mm}`);
    appendTrace(opts.cwd, {
      type: "verify",
      status: "fail",
      reason: "mismatch",
      mismatches: verdict.mismatches,
    });
    return { exitCode: verdict.exitCode, stderr: err, stdout: out };
  } else {
    for (const w of verdict.warnings) err.push(`WARN: ${w}`);
    appendTrace(opts.cwd, {
      type: "verify",
      status: "ok",
      filesChecked: verdict.filesChecked,
    });
  }

  // 2. Load workflow + resolve next step.
  const workflow = readWorkflow(opts.cwd);
  for (const w of validateWorkflow(workflow)) {
    err.push(`WARN: workflow composition — ${w.message}`);
    appendTrace(opts.cwd, { type: "workflow.warn", status: "warn", ...w });
  }
  const state = readState(opts.cwd);
  const slug = opts.slug ?? state.activeSlug ?? "default";
  const nextStep = resolveNextStep({ cwd: opts.cwd, slug, workflow, state });
  if (!nextStep) {
    out.push("run next: workflow complete — no remaining steps");
    appendTrace(opts.cwd, { type: "run.complete", status: "ok", slug });
    return { exitCode: 0, stderr: err, stdout: out };
  }

  // 3. Execute or checkpoint.
  if (nextStep.external) {
    out.push(
      `run next: external step '${nextStep.step}' — complete the work then run:\n` +
        `  skills-repo artefact ${slug} mark-step-done ${nextStep.step}`,
    );
    appendTrace(opts.cwd, {
      type: "run.external",
      status: "ok",
      slug,
      step: nextStep.step,
    });
    // Keep exit code non-zero-but-expected so scripts can branch.
    return { exitCode: 2, stderr: err, stdout: out };
  }

  // Non-external step → scaffold the produces file with the SKILL.md body as
  // instructions, and record the step as started in state. The operator edits
  // the file to complete the step; next `run next` sees the file exists and
  // moves on.
  if (!nextStep.skill || !nextStep.produces) {
    err.push(`step '${nextStep.step}' is malformed (missing skill or produces)`);
    return { exitCode: 2, stderr: err, stdout: out };
  }
  const dest = join(artefactsPath(opts.cwd), slug, nextStep.produces);
  if (!existsSync(dest)) {
    let body: string;
    try {
      body = loadSkillBody(opts.cwd, nextStep.skill);
    } catch (e) {
      err.push(`cannot load skill '${nextStep.skill}': ${(e as Error).message}`);
      return { exitCode: 2, stderr: err, stdout: out };
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(
      dest,
      scaffoldArtefactHeader(nextStep.step, nextStep.skill, body),
      "utf8",
    );
  }
  state.activeSlug = slug;
  writeState(opts.cwd, state);
  out.push(
    `run next: step '${nextStep.step}' (skill=${nextStep.skill}) → ${dest}`,
  );
  appendTrace(opts.cwd, {
    type: "run.step",
    status: "ok",
    slug,
    step: nextStep.step,
    skill: nextStep.skill,
    artefact: dest,
  });
  return { exitCode: 0, stderr: err, stdout: out };
}

function scaffoldArtefactHeader(step: string, skill: string, skillBody: string): string {
  return (
    `# ${step}\n\n` +
    `<!-- Scaffolded by \`skills-repo run next\`.\n` +
    `     Edit this file to complete the step. Once saved, run \`skills-repo run next\`\n` +
    `     again to advance the workflow. -->\n\n` +
    `**Step:** ${step}\n` +
    `**Skill:** ${skill}\n` +
    `**Scaffolded:** ${new Date().toISOString()}\n\n` +
    `---\n\n` +
    `## Skill instructions (from \`.skills-repo/skills/${skill}/SKILL.md\`)\n\n` +
    skillBody
  );
}

/**
 * Legacy ps1.1 skeleton execution path — preserved so skeleton-mode tests
 * keep passing. Runs the single trivial built-in skill.
 */
async function runSkeleton(
  opts: RunOptions,
  out: string[],
  err: string[],
): Promise<RunResult> {
  const slug = opts.slug ?? "default";
  const { path } = executeTrivialSkill(opts.cwd, slug);
  out.push(`run next: executed skill '${TRIVIAL_SKILL_ID}' → ${path}`);
  appendTrace(opts.cwd, {
    type: "run.step",
    status: "ok",
    skill: TRIVIAL_SKILL_ID,
    slug,
    artefact: path,
  });
  return { exitCode: 0, stderr: err, stdout: out };
}
