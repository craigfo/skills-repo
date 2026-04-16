import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { readState, writeState } from "../engine/workflow.js";
import { appendTrace } from "../engine/trace.js";
import { artefactsPath } from "../engine/paths.js";

export interface MarkStepDoneOptions {
  cwd: string;
  subcommand: "mark-step-done";
  slug: string;
  step: string;
}

export interface ArtefactNewOptions {
  cwd: string;
  subcommand: "new";
  slug: string;
}

export type ArtefactOptions = MarkStepDoneOptions | ArtefactNewOptions;

export interface ArtefactResult {
  exitCode: number;
  stderr: string[];
  stdout: string[];
}

export async function runArtefact(opts: ArtefactOptions): Promise<ArtefactResult> {
  const out: string[] = [];
  const err: string[] = [];

  if (opts.subcommand === "new") {
    const dir = join(artefactsPath(opts.cwd), opts.slug);
    if (existsSync(dir)) {
      err.push(`artefact folder already exists at artefacts/${opts.slug}/`);
      return { exitCode: 2, stderr: err, stdout: out };
    }
    mkdirSync(join(dir, "reference"), { recursive: true });
    const state = readState(opts.cwd);
    state.activeSlug = opts.slug;
    writeState(opts.cwd, state);
    out.push(
      `artefact new: created artefacts/${opts.slug}/reference/; active feature → '${opts.slug}'`,
    );
    appendTrace(opts.cwd, { type: "artefact.new", status: "ok", slug: opts.slug });
    return { exitCode: 0, stderr: err, stdout: out };
  }

  if (opts.subcommand === "mark-step-done") {
    const state = readState(opts.cwd);
    state.activeSlug = opts.slug;
    state.marks[opts.step] = new Date().toISOString();
    writeState(opts.cwd, state);
    out.push(`artefact ${opts.slug}: step '${opts.step}' marked done`);
    appendTrace(opts.cwd, {
      type: "artefact.mark-step-done",
      status: "ok",
      slug: opts.slug,
      step: opts.step,
    });
    return { exitCode: 0, stderr: err, stdout: out };
  }

  err.push(`unknown artefact sub-command`);
  return { exitCode: 2, stderr: err, stdout: out };
}
