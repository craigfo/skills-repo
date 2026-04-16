import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Preset } from "./preset.js";
import { classifyRef, type RefKind } from "./ref-classify.js";
import { sidecarPath } from "./paths.js";

export interface FetchInput {
  cwd: string;
  source: string;
  ref: string;
  preset: Preset;
}

export interface FetchResult {
  refKind: RefKind;
  files: string[]; // relative-to-sidecar paths written
  warnings: string[];
}

/**
 * Clone <source>@<ref> into a tmp dir (shallow), copy the preset's mapped
 * files byte-for-byte into `.skills-repo/`, then remove the tmp.
 *
 * Transactional: on any failure after cloning, the partially-populated
 * skills/ and standards/ directories under the sidecar are removed so the
 * caller can retry from a clean state.
 */
export function fetchSkillsAndStandards(input: FetchInput): FetchResult {
  const { cwd, source, ref, preset } = input;
  const refKind = classifyRef(source, ref);
  const warnings: string[] = [];
  if (refKind === "branch") {
    warnings.push(
      `branch ref '${ref}': reproducibility depends on the branch not being force-pushed; prefer a tag or commit SHA.`,
    );
  }

  const tmp = mkdtempSync(join(tmpdir(), "skills-repo-fetch-"));
  try {
    execFileSync(
      "git",
      ["clone", "--depth=1", "--branch", ref, "--quiet", source, tmp],
      { stdio: "pipe" },
    );

    const writtenFiles: string[] = [];
    try {
      for (const m of preset.mappings) {
        const src = join(tmp, m.from);
        const dest = join(sidecarPath(cwd), m.to);
        if (!existsSync(src)) {
          throw new Error(`source file missing at '${m.from}' in ${source}@${ref}`);
        }
        const buf = readFileSync(src); // raw Buffer → preserves bytes exactly
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buf);
        writtenFiles.push(m.to);
      }
      return { refKind, files: writtenFiles, warnings };
    } catch (e) {
      // Roll back partially-written content.
      rollback(cwd);
      throw e;
    }
  } catch (e) {
    if ((e as Error).message && !(e as Error).message.includes("source file missing")) {
      // Clone failed — nothing to roll back inside sidecar, but be explicit.
      throw new Error(`fetch failed for ${source}@${ref}: ${(e as Error).message.trim()}`);
    }
    throw e;
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

function rollback(cwd: string): void {
  for (const sub of ["skills", "standards"]) {
    const p = join(sidecarPath(cwd), sub);
    try { rmSync(p, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
