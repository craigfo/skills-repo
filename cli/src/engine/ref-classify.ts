import { execFileSync } from "node:child_process";

export type RefKind = "commit" | "tag" | "branch";

const COMMIT_RE = /^[0-9a-f]{7,40}$/i;

/**
 * Classify a ref against a remote URL.
 *   - 7–40 hex chars → `commit`
 *   - matches `refs/tags/<ref>` on the remote → `tag`
 *   - otherwise → `branch` (caller should warn)
 */
export function classifyRef(url: string, ref: string): RefKind {
  if (COMMIT_RE.test(ref)) return "commit";
  try {
    const out = execFileSync("git", ["ls-remote", "--tags", url, `refs/tags/${ref}`], {
      stdio: "pipe",
    }).toString();
    if (out.trim().length > 0) return "tag";
  } catch {
    // ls-remote failure leaves us to default
  }
  return "branch";
}
