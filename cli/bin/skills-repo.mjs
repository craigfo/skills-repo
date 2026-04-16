#!/usr/bin/env node
// Entry shim: delegate to the tsx bundled CLI so the TypeScript entry runs
// regardless of the caller's working directory (the test harness spawns us
// in a tmp repo where no node_modules exists).
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const entry = resolve(here, "..", "src", "cli.ts");

// Resolve tsx's bin script via the cli package's node_modules.
const tsxCli = resolve(here, "..", "node_modules", "tsx", "dist", "cli.mjs");
if (!existsSync(tsxCli)) {
  process.stderr.write(
    `skills-repo: tsx not found at ${tsxCli}. Run 'npm install' in the cli package.\n`,
  );
  process.exit(127);
}

const child = spawn(
  process.execPath,
  [tsxCli, entry, ...process.argv.slice(2)],
  { stdio: "inherit" },
);
child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
