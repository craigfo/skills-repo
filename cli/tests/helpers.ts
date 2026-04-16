import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function mkTmpRepo(withGit = true): string {
  const dir = mkdtempSync(join(tmpdir(), "skills-repo-test-"));
  if (withGit) {
    execFileSync("git", ["init", "-q"], { cwd: dir });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
  }
  return dir;
}

export function rmrf(dir: string): void {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

export function exists(p: string): boolean {
  return existsSync(p);
}

export function readText(p: string): string {
  return readFileSync(p, "utf8");
}

export function writeText(p: string, body: string): void {
  writeFileSync(p, body, "utf8");
}

export function gitStatusPorcelain(cwd: string): string[] {
  const out = execFileSync("git", ["status", "--porcelain"], { cwd }).toString();
  return out.split(/\r?\n/).filter(Boolean);
}
