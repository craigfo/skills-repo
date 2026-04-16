import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { artefactsPath } from "./paths.js";

export const TRIVIAL_SKILL_ID = "trivial";

export const TRIVIAL_SKILL_BODY = `---
name: trivial
description: Built-in skeleton skill for ps1.1 walking-skeleton. Writes one Markdown file to artefacts/<slug>/.
---

# Trivial Skill (built-in)

This is the only skill available in the ps1.1 skeleton build. It produces a single
artefact file and exists to prove that the CLI package → \`init\` → \`run next\` →
artefact chain works end-to-end.

Real skills arrive in ps2.1 (fetch) and ps3.1 (workflow schema + preset).
`;

export function executeTrivialSkill(cwd: string, slug: string): { path: string } {
  const folder = join(artefactsPath(cwd), slug);
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
  const filepath = join(folder, "hello.md");
  const body = `# Hello from skills-repo

This artefact was produced by the **trivial** built-in skill during \`skills-repo run next\`.

Slug: \`${slug}\`
Produced at: ${new Date().toISOString()}

The walking-skeleton CLI package is working: the trivial skill executed, an artefact
was written, and a trace line was appended to \`.skills-repo/traces/\`. That's ps1.1.
`;
  writeFileSync(filepath, body, "utf8");
  return { path: filepath };
}
