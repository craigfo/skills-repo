import { execFileSync } from "node:child_process";

export function isGitRepo(cwd: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}
