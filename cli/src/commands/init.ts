import { isGitRepo } from "../engine/git.js";
import { scaffoldSidecar, persistSourceToProfile, type SourceMeta } from "../engine/sidecar.js";
import { appendTrace } from "../engine/trace.js";
import { fetchSkillsAndStandards } from "../engine/fetch.js";
import { getPreset, STORY_UNIT_MIN } from "../engine/preset.js";
import { writeLockFile } from "../engine/lock.js";

// Engine version advertised in the lockfile. Keep in sync with cli/package.json.
const ENGINE_VERSION = "0.1.0-mvp.1";

export interface InitOptions {
  cwd: string;
  yes: boolean;
  source?: string;
  ref?: string;
  preset?: string;
}

export interface InitResult {
  exitCode: number;
  stderr: string[];
  stdout: string[];
}

export async function runInit(
  opts: InitOptions,
  prompter?: (q: string) => Promise<boolean>,
): Promise<InitResult> {
  const out: string[] = [];
  const err: string[] = [];
  if (!isGitRepo(opts.cwd)) {
    err.push("current directory is not a git repository");
    return { exitCode: 1, stderr: err, stdout: out };
  }

  let append = opts.yes;
  if (!opts.yes && prompter) {
    append = await prompter(
      "Append .skills-repo/state/ and .skills-repo/cache/ to .gitignore? [Y/n] ",
    );
  }

  const wantFetch = Boolean(opts.source && opts.ref);
  if (opts.source && !opts.ref) {
    err.push("--source provided without --ref; specify a tag, commit SHA, or branch");
    return { exitCode: 2, stderr: err, stdout: out };
  }
  if (opts.ref && !opts.source) {
    err.push("--ref provided without --source; specify the source URL");
    return { exitCode: 2, stderr: err, stdout: out };
  }

  const sourceMeta: SourceMeta | undefined = wantFetch
    ? { url: opts.source!, ref: opts.ref! }
    : undefined;

  scaffoldSidecar(opts.cwd, {
    appendGitignore: append,
    withTrivial: !wantFetch,
    source: sourceMeta,
  });

  if (wantFetch) {
    const preset = opts.preset ? getPreset(opts.preset) : STORY_UNIT_MIN;
    try {
      const result = fetchSkillsAndStandards({
        cwd: opts.cwd,
        source: sourceMeta!.url,
        ref: sourceMeta!.ref,
        preset,
      });
      persistSourceToProfile(opts.cwd, {
        url: sourceMeta!.url,
        ref: sourceMeta!.ref,
        refKind: result.refKind,
      });
      writeLockFile({
        cwd: opts.cwd,
        engineVersion: ENGINE_VERSION,
        source: {
          url: sourceMeta!.url,
          ref: sourceMeta!.ref,
          refKind: result.refKind,
        },
        files: result.files,
      });
      for (const w of result.warnings) err.push(`WARN: ${w}`);
      out.push(
        `init: fetched ${result.files.length} file(s) from ${sourceMeta!.url}@${sourceMeta!.ref} (refKind=${result.refKind}); lock.json written`,
      );
      appendTrace(opts.cwd, {
        type: "fetch",
        status: "ok",
        source: sourceMeta!.url,
        ref: sourceMeta!.ref,
        refKind: result.refKind,
        files: result.files.length,
      });
    } catch (e) {
      err.push(`fetch failed: ${(e as Error).message}`);
      appendTrace(opts.cwd, {
        type: "fetch",
        status: "fail",
        source: sourceMeta!.url,
        ref: sourceMeta!.ref,
        error: (e as Error).message,
      });
      return { exitCode: 4, stderr: err, stdout: out };
    }
  } else {
    out.push("init: skeleton mode (no --source/--ref); trivial built-in skill registered");
  }

  appendTrace(opts.cwd, {
    type: "init",
    status: "ok",
    mode: wantFetch ? "fetched" : "skeleton",
  });
  return { exitCode: 0, stderr: err, stdout: out };
}
