import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { sidecarPath, lockPath } from "./paths.js";
import type { RefKind } from "./ref-classify.js";

export interface LockFileEntry {
  path: string; // relative to .skills-repo/
  sha256: string; // lowercase hex
}

export interface LockFile {
  version: 1;
  hashAlgorithm: "sha256";
  engineVersion: string;
  source: {
    url: string;
    ref: string;
    refKind: RefKind;
  };
  files: LockFileEntry[];
}

export function sha256Hex(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export function sha256Path(p: string): string {
  return sha256Hex(readFileSync(p));
}

export interface WriteLockInput {
  cwd: string;
  engineVersion: string;
  source: { url: string; ref: string; refKind: RefKind };
  files: string[]; // relative to .skills-repo/
}

export function writeLockFile(input: WriteLockInput): LockFile {
  const entries: LockFileEntry[] = input.files
    .map((rel) => ({
      path: rel,
      sha256: sha256Path(join(sidecarPath(input.cwd), rel)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const lock: LockFile = {
    version: 1,
    hashAlgorithm: "sha256",
    engineVersion: input.engineVersion,
    source: input.source,
    files: entries,
  };
  writeFileSync(lockPath(input.cwd), JSON.stringify(lock, null, 2) + "\n", "utf8");
  return lock;
}

export function readLockFile(cwd: string): LockFile | null {
  const p = lockPath(cwd);
  if (!existsSync(p)) return null;
  const body = readFileSync(p, "utf8").trim();
  if (body.length === 0) return null;
  try {
    const parsed = JSON.parse(body) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      (parsed as { version: unknown }).version === 1
    ) {
      return parsed as LockFile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Exit-code contract (surface in CLI):
 *   3 → lockfile missing
 *   4 → a file in lockfile is missing from disk
 *   5 → hash mismatch
 *   0 → all match
 */
export type VerifyResult =
  | { result: "pass"; filesChecked: number; warnings: string[] }
  | { result: "skeleton-mode" } // lockfile exists but has no source — ps1.1 placeholder, skip verification
  | { result: "no-lockfile"; exitCode: 3 } // lockfile file missing entirely
  | { result: "missing-file"; exitCode: 4; path: string }
  | { result: "mismatch"; exitCode: 5; mismatches: LockMismatch[] };

export interface LockMismatch {
  path: string;
  expected: string;
  actual: string;
}

export function verifyAgainstLock(cwd: string): VerifyResult {
  const p = lockPath(cwd);
  if (!existsSync(p)) return { result: "no-lockfile", exitCode: 3 };
  const lock = readLockFile(cwd);
  // File present but parse failure or no source (skeleton placeholder) → skeleton mode
  if (!lock || !lock.source) return { result: "skeleton-mode" };
  const warnings: string[] = [];
  if (lock.source.refKind === "branch") {
    warnings.push(
      `branch ref '${lock.source.ref}': reproducibility depends on the branch not being force-pushed`,
    );
  }
  const mismatches: LockMismatch[] = [];
  for (const entry of lock.files) {
    const full = join(sidecarPath(cwd), entry.path);
    if (!existsSync(full)) {
      return { result: "missing-file", exitCode: 4, path: entry.path };
    }
    const actual = sha256Path(full);
    if (actual !== entry.sha256) {
      mismatches.push({ path: entry.path, expected: entry.sha256, actual });
    }
  }
  if (mismatches.length > 0) {
    return { result: "mismatch", exitCode: 5, mismatches };
  }
  return { result: "pass", filesChecked: lock.files.length, warnings };
}
