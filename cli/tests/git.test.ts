import { describe, it, expect, afterEach } from "vitest";
import { isGitRepo } from "../src/engine/git.js";
import { mkTmpRepo, rmrf } from "./helpers.js";

describe("git.isGitRepo", () => {
  const cleanup: string[] = [];
  afterEach(() => {
    cleanup.forEach(rmrf);
    cleanup.length = 0;
  });

  it("returns true inside a git repo", () => {
    const dir = mkTmpRepo(true);
    cleanup.push(dir);
    expect(isGitRepo(dir)).toBe(true);
  });

  it("returns false for a plain directory with no git", () => {
    const dir = mkTmpRepo(false);
    cleanup.push(dir);
    expect(isGitRepo(dir)).toBe(false);
  });
});
