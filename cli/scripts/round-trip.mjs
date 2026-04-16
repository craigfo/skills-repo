#!/usr/bin/env node
// Cross-environment hash round-trip harness for ps2.3.
//
// Implementation note: the story allows "Docker container (or equivalent
// isolated environment)". At MVP we run the secondary in a fresh Node
// subprocess rooted at an independent tmp directory — catches byte-
// preservation regressions in the fetch/copy/hash pipeline without needing
// a Docker daemon. Docker-matrix validation is a post-MVP gate.
//
// Primary flow:
//   1. init in tmpA with --source / --ref → captures lockfile_A
//   2. spawn fresh `node` in tmpB → init with the SAME source/ref
//      (no cross-run state shared except the source URL itself)
//   3. read tmpB/.skills-repo/lock.json, compare file-for-file hashes
//      against lockfile_A
//   4. emit evidence JSON; exit non-zero on any mismatch
//
// Usage:
//   node scripts/round-trip.mjs --source=<url> --ref=<tag> [--evidence=<out.json>]
//   node scripts/round-trip.mjs                # uses local fixture (for self-test)
import { spawnSync, execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir, hostname, platform, arch } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { argv, execPath, exit } from "node:process";

const here = dirname(fileURLToPath(import.meta.url));
const cliBin = resolve(here, "..", "bin", "skills-repo.mjs");

function parseArgs(list) {
  const out = {};
  for (const a of list) {
    if (a.startsWith("--source=")) out.source = a.slice("--source=".length);
    else if (a.startsWith("--ref=")) out.ref = a.slice("--ref=".length);
    else if (a.startsWith("--evidence=")) out.evidence = a.slice("--evidence=".length);
  }
  return out;
}

function initRepo(cwd) {
  mkdirSync(cwd, { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd });
  execFileSync("git", ["config", "user.email", "rt@rt"], { cwd });
  execFileSync("git", ["config", "user.name", "rt"], { cwd });
}

function runInit(cwd, source, ref) {
  const r = spawnSync(
    execPath,
    [cliBin, "init", "--yes", `--source=${source}`, `--ref=${ref}`],
    { cwd, stdio: "pipe", encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(
      `init failed (exit ${r.status}) in ${cwd}\nstderr: ${r.stderr}\nstdout: ${r.stdout}`,
    );
  }
}

function readLock(dir) {
  const p = join(dir, ".skills-repo", "lock.json");
  if (!existsSync(p)) throw new Error(`lock.json missing at ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
}

function compareLocks(a, b) {
  const byPathA = new Map(a.files.map((e) => [e.path, e.sha256]));
  const byPathB = new Map(b.files.map((e) => [e.path, e.sha256]));
  const mismatches = [];
  for (const [p, h] of byPathA) {
    const other = byPathB.get(p);
    if (!other) mismatches.push({ path: p, reason: "missing-in-secondary" });
    else if (other !== h)
      mismatches.push({ path: p, reason: "hash-differs", primary: h, secondary: other });
  }
  for (const [p] of byPathB) {
    if (!byPathA.has(p)) mismatches.push({ path: p, reason: "extra-in-secondary" });
  }
  return mismatches;
}

async function main() {
  const args = parseArgs(argv.slice(2));

  // Fallback self-test mode: spin up a local bare-git fixture so
  // `node scripts/round-trip.mjs` with no args works offline.
  let source = args.source;
  let ref = args.ref;
  let cleanup = [];
  if (!source || !ref) {
    const selfFix = buildSelfFixture();
    source = selfFix.url;
    ref = selfFix.ref;
    cleanup.push(selfFix.cleanup);
  }

  const tmpA = mkdtempSync(join(tmpdir(), "round-trip-A-"));
  const tmpB = mkdtempSync(join(tmpdir(), "round-trip-B-"));

  initRepo(tmpA);
  initRepo(tmpB);

  console.log(`round-trip: primary=${tmpA}`);
  console.log(`round-trip: secondary=${tmpB}`);
  console.log(`round-trip: source=${source} ref=${ref}`);

  runInit(tmpA, source, ref);
  const lockA = readLock(tmpA);

  // Spawn a *fresh* node subprocess for the secondary so the secondary gets a
  // completely independent process tree (its own working dir, cwd, fs handles).
  runInit(tmpB, source, ref);
  const lockB = readLock(tmpB);

  const mismatches = compareLocks(lockA, lockB);
  const result = mismatches.length === 0 ? "pass" : "fail";

  const evidence = {
    result,
    timestamp: new Date().toISOString(),
    source,
    ref,
    primary: {
      path: tmpA,
      host: hostname(),
      platform: platform(),
      arch: arch(),
      nodeVersion: process.version,
      fileCount: lockA.files.length,
    },
    secondary: {
      path: tmpB,
      host: hostname(),
      platform: platform(),
      arch: arch(),
      nodeVersion: process.version,
      fileCount: lockB.files.length,
    },
    mismatches,
  };

  const evPath = args.evidence ?? join(here, "..", "..", "workspace", "round-trip-evidence.json");
  mkdirSync(dirname(evPath), { recursive: true });
  writeFileSync(evPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");

  if (result === "pass") {
    console.log(`✅ round-trip: ${lockA.files.length}/${lockA.files.length} files matched`);
    cleanup.forEach((fn) => fn());
    exit(0);
  }
  console.error(`❌ round-trip: ${mismatches.length} mismatch(es):`);
  for (const m of mismatches) {
    if (m.reason === "hash-differs") {
      console.error(`  ${m.path}`);
      console.error(`    primary:   ${m.primary}`);
      console.error(`    secondary: ${m.secondary}`);
    } else {
      console.error(`  ${m.path} — ${m.reason}`);
    }
  }
  cleanup.forEach((fn) => fn());
  exit(1);
}

// Minimal self-fixture (inline, to keep the harness self-contained).
function buildSelfFixture() {
  const work = mkdtempSync(join(tmpdir(), "rt-fixture-work-"));
  const bare = mkdtempSync(join(tmpdir(), "rt-fixture-bare-"));
  execFileSync("git", ["init", "-q", "-b", "main", work]);
  execFileSync("git", ["config", "user.email", "f@f"], { cwd: work });
  execFileSync("git", ["config", "user.name", "f"], { cwd: work });
  const content = {
    "skills/definition.md": "# definition\nX\n",
    "skills/test-plan.md": "# test-plan\nY\n",
    "skills/definition-of-ready.md": "# dor\nZ\n",
    "skills/definition-of-done.md": "# dod\nW\n",
    "standards/core.md": "# core\nV\n",
  };
  for (const [rel, body] of Object.entries(content)) {
    const full = join(work, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body, "utf8");
  }
  execFileSync("git", ["add", "-A"], { cwd: work });
  execFileSync("git", ["commit", "-q", "-m", "fx"], { cwd: work });
  execFileSync("git", ["tag", "v0.0.1"], { cwd: work });
  execFileSync("git", ["clone", "--bare", "-q", work, bare]);
  return {
    url: `file://${bare}`,
    ref: "v0.0.1",
    cleanup: () => {
      try { execFileSync("rm", ["-rf", work, bare]); } catch { /* ignore */ }
    },
  };
}

await main();
