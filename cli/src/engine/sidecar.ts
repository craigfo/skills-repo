import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  SIDECAR,
  sidecarPath,
  artefactsPath,
  statePath,
  tracesPath,
  skillsPath,
  workflowPath,
  profilePath,
  lockPath,
  gitignorePath,
} from "./paths.js";
import { TRIVIAL_SKILL_ID, TRIVIAL_SKILL_BODY } from "./trivial-skill.js";
import type { RefKind } from "./ref-classify.js";
import { STORY_UNIT_MIN_WORKFLOW_YAML } from "./workflow.js";

export const SKELETON_WORKFLOW_YAML = `# ps1.1 walking-skeleton workflow — single built-in trivial step.
# Real workflow.yaml shape lands in ps3.1.
version: 1
unit: skeleton
steps:
  - step: trivial
    skill: ${TRIVIAL_SKILL_ID}
    produces: hello.md
`;

export const SKELETON_LOCK_JSON = `{
  "comment": "ps1.1 walking-skeleton placeholder; real lockfile with source+hashes arrives in ps2.2.",
  "engineVersion": null,
  "source": null,
  "files": []
}
`;

export interface SourceMeta {
  url: string;
  ref: string;
  refKind?: RefKind;
}

export interface ScaffoldOptions {
  appendGitignore: boolean;
  withTrivial: boolean;
  source?: SourceMeta;
}

export interface ScaffoldResult {
  created: string[];
  skippedGitignore: boolean;
}

function skeletonProfileYaml(source?: SourceMeta): string {
  const base = `# Skills-repo sidecar profile.
version: 1
unit: skeleton
`;
  if (!source) return base;
  const kind = source.refKind ? `\n  refKind: ${source.refKind}` : "";
  return (
    base +
    `source:
  url: ${source.url}
  ref: ${source.ref}${kind}
`
  );
}

export function scaffoldSidecar(cwd: string, opts: ScaffoldOptions): ScaffoldResult {
  const created: string[] = [];
  const mk = (p: string) => {
    if (!existsSync(p)) {
      mkdirSync(p, { recursive: true });
      created.push(p);
    }
  };
  const wf = (p: string, body: string) => {
    if (!existsSync(p)) {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, body, "utf8");
      created.push(p);
    }
  };

  mk(sidecarPath(cwd));
  mk(artefactsPath(cwd));
  mk(statePath(cwd));
  mk(tracesPath(cwd));
  mk(skillsPath(cwd));

  // Skeleton mode uses the single-step trivial workflow; sourced mode uses
  // the real preset workflow so `run next` resolves against real skills.
  wf(
    workflowPath(cwd),
    opts.withTrivial ? SKELETON_WORKFLOW_YAML : STORY_UNIT_MIN_WORKFLOW_YAML,
  );
  wf(profilePath(cwd), skeletonProfileYaml(opts.source));
  wf(lockPath(cwd), SKELETON_LOCK_JSON);

  if (opts.withTrivial) {
    mk(join(skillsPath(cwd), TRIVIAL_SKILL_ID));
    wf(join(skillsPath(cwd), TRIVIAL_SKILL_ID, "SKILL.md"), TRIVIAL_SKILL_BODY);
  }

  let skippedGitignore = false;
  if (opts.appendGitignore) {
    const giPath = gitignorePath(cwd);
    const existing = existsSync(giPath) ? readFileSync(giPath, "utf8") : "";
    const lines = [`${SIDECAR}/state/`, `${SIDECAR}/cache/`];
    const missing = lines.filter((l) => !existing.split(/\r?\n/).includes(l));
    if (missing.length > 0) {
      const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
      appendFileSync(giPath, prefix + missing.join("\n") + "\n", "utf8");
      created.push(giPath);
    } else {
      skippedGitignore = true;
    }
  } else {
    skippedGitignore = true;
  }
  return { created, skippedGitignore };
}

export function isSidecarInitialised(cwd: string): boolean {
  return existsSync(workflowPath(cwd)) && existsSync(skillsPath(cwd));
}

/**
 * Rewrite profile.yaml to include the resolved source + refKind after a
 * successful fetch. Keeps the rest of the file minimal; future stories
 * (ps3.x) replace this with a structured YAML writer.
 */
export function persistSourceToProfile(cwd: string, source: SourceMeta): void {
  writeFileSync(profilePath(cwd), skeletonProfileYaml(source), "utf8");
}
