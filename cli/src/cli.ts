import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runInit } from "./commands/init.js";
import { runNext } from "./commands/run.js";
import { runArtefact } from "./commands/artefact.js";
import { runStatus } from "./commands/status.js";

function printUsage(): void {
  process.stderr.write(
    `skills-repo <command>

Commands:
  init [--yes] [--source=<url> --ref=<tag>] [--preset=<id>]
                             Scaffold .skills-repo/ + artefacts/; optionally
                             fetch skills + standards from a configurable
                             git source and write the pinned lock.json.
  status                     Print current pipeline position + next step.
                             Exit 1 if a blocking issue (missing lockfile,
                             hash mismatch) is detected.
  run next                   Execute the next pending workflow step.
                             Exit 2 on an external step.
  artefact new <slug>        Scaffold artefacts/<slug>/reference/ and mark
                             <slug> as the active feature.
  artefact <slug> mark-step-done <step>
                             Mark an external step complete so the workflow
                             resolver advances past it.
  --help                     Show this message.

Exit codes:
  0 ok | 1 blocking issue / sidecar not init | 2 external checkpoint / usage
  3 missing lock.json | 4 lockfile file missing on disk | 5 hash mismatch

Notes:
  Requires the current directory to be a git repository.
`,
  );
}

async function promptYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const a = (await rl.question(question)).trim().toLowerCase();
    return a === "" || a === "y" || a === "yes";
  } finally {
    rl.close();
  }
}

interface ParsedFlags {
  yes: boolean;
  source?: string;
  ref?: string;
  preset?: string;
  positional: string[];
}

function parseFlags(argv: string[]): ParsedFlags {
  const out: ParsedFlags = { yes: false, positional: [] };
  for (const a of argv) {
    if (a === "--yes" || a === "-y") out.yes = true;
    else if (a.startsWith("--source=")) out.source = a.slice("--source=".length);
    else if (a.startsWith("--ref=")) out.ref = a.slice("--ref=".length);
    else if (a.startsWith("--preset=")) out.preset = a.slice("--preset=".length);
    else out.positional.push(a);
  }
  return out;
}

async function main(argv: string[]): Promise<number> {
  const cwd = process.cwd();
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printUsage();
    return argv.length === 0 ? 1 : 0;
  }
  const cmd = argv[0];
  const flags = parseFlags(argv.slice(1));

  if (cmd === "init") {
    const res = await runInit(
      {
        cwd,
        yes: flags.yes,
        source: flags.source,
        ref: flags.ref,
        preset: flags.preset,
      },
      flags.yes ? undefined : promptYesNo,
    );
    res.stdout.forEach((l) => process.stdout.write(l + "\n"));
    res.stderr.forEach((l) => process.stderr.write(l + "\n"));
    return res.exitCode;
  }
  if (cmd === "run" && flags.positional[0] === "next") {
    const res = await runNext({ cwd });
    res.stdout.forEach((l) => process.stdout.write(l + "\n"));
    res.stderr.forEach((l) => process.stderr.write(l + "\n"));
    return res.exitCode;
  }
  if (cmd === "status") {
    const res = await runStatus({ cwd });
    res.stdout.forEach((l) => process.stdout.write(l + "\n"));
    res.stderr.forEach((l) => process.stderr.write(l + "\n"));
    return res.exitCode;
  }
  if (cmd === "artefact") {
    // artefact new <slug>    |    artefact <slug> mark-step-done <step>
    const pos = flags.positional;
    if (pos[0] === "new" && pos[1] && pos.length === 2) {
      const res = await runArtefact({ cwd, subcommand: "new", slug: pos[1] });
      res.stdout.forEach((l) => process.stdout.write(l + "\n"));
      res.stderr.forEach((l) => process.stderr.write(l + "\n"));
      return res.exitCode;
    }
    if (pos.length === 3 && pos[1] === "mark-step-done") {
      const res = await runArtefact({
        cwd,
        subcommand: "mark-step-done",
        slug: pos[0],
        step: pos[2],
      });
      res.stdout.forEach((l) => process.stdout.write(l + "\n"));
      res.stderr.forEach((l) => process.stderr.write(l + "\n"));
      return res.exitCode;
    }
    process.stderr.write(
      "usage:\n  skills-repo artefact new <slug>\n  skills-repo artefact <slug> mark-step-done <step>\n",
    );
    return 2;
  }
  process.stderr.write(`unknown command: ${argv.join(" ")}\n`);
  printUsage();
  return 2;
}

const code = await main(process.argv.slice(2));
process.exit(code);
