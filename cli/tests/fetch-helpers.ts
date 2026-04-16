import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

export interface FixtureOptions {
  files: Record<string, string>; // relative path → content
  tag?: string;
  branch?: string;
}

/**
 * Create a local bare-git fixture repo that the fetch module can clone
 * via a file:// URL. No network.
 *
 * Returns the absolute filesystem path (suitable as a clone source on
 * macOS/Linux) and the URL form.
 */
export function mkFixtureRepo(opts: FixtureOptions): { dir: string; url: string; ref: string; refKind: "tag" | "branch" } {
  const workDir = mkdtempSync(join(tmpdir(), "skills-repo-fixture-work-"));
  const bareDir = mkdtempSync(join(tmpdir(), "skills-repo-fixture-bare-"));

  execFileSync("git", ["init", "-q", "-b", "main", workDir]);
  execFileSync("git", ["config", "user.email", "fixture@example.com"], { cwd: workDir });
  execFileSync("git", ["config", "user.name", "Fixture"], { cwd: workDir });

  for (const [rel, body] of Object.entries(opts.files)) {
    const full = join(workDir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body, "utf8");
  }

  execFileSync("git", ["add", "-A"], { cwd: workDir });
  execFileSync(
    "git",
    ["commit", "-q", "-m", "fixture content"],
    { cwd: workDir, env: { ...process.env, GIT_COMMITTER_DATE: "2026-04-15T00:00:00Z" } },
  );

  const ref = opts.tag ?? opts.branch ?? "main";
  const refKind: "tag" | "branch" = opts.tag ? "tag" : "branch";
  if (opts.tag) {
    execFileSync("git", ["tag", opts.tag], { cwd: workDir });
  }
  // clone --bare so we have a URL the fetch module can clone from
  execFileSync("git", ["clone", "--bare", "-q", workDir, bareDir]);

  return {
    dir: bareDir,
    url: `file://${bareDir}`,
    ref,
    refKind,
  };
}
