#!/usr/bin/env node
/**
 * scripts/current-feature-slug.js — ec3.1 slug-derivation helper (AC0).
 *
 * Resolves the active feature-slug at skill-write time. Used by the
 * per-skill state-update stanza added across 30+ SKILL.md files.
 *
 * Resolution order:
 *   1. workspace/state.json activeFeature.slug (most reliable)
 *   2. Current git branch parsed as feature/<slug> (inner-loop branches)
 *   3. Walk up from cwd until an artefacts/<slug>/ dir is found
 *
 * On success: prints the slug to stdout and exits 0.
 * On failure: prints an error to stderr and exits 1.
 *
 * Usage:
 *   node scripts/current-feature-slug.js [--verbose]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const VERBOSE = process.argv.includes("--verbose");
function log(msg) {
  if (VERBOSE) console.error(`[current-feature-slug] ${msg}`);
}

function fromWorkspaceState() {
  // Walk up from cwd to find the repo root (where workspace/state.json lives)
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, "workspace/state.json");
    if (fs.existsSync(candidate)) {
      try {
        const state = JSON.parse(fs.readFileSync(candidate, "utf8"));
        if (state.activeFeature && state.activeFeature.slug) {
          log(`workspace/state.json → ${state.activeFeature.slug}`);
          return state.activeFeature.slug;
        }
      } catch (err) {
        log(`workspace/state.json parse error: ${err.message}`);
      }
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  log("workspace/state.json: no activeFeature.slug");
  return null;
}

function fromBranchName() {
  let branch;
  try {
    branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch (err) {
    log(`git branch failed: ${err.message}`);
    return null;
  }
  if (!branch) return null;
  // Match feature/<slug> or feature/<slug>-<qualifier>
  const m = branch.match(/^feature\/(.+)$/);
  if (!m) {
    log(`branch ${branch} does not match feature/<slug>`);
    return null;
  }
  const raw = m[1];
  // An inner-loop branch is feature/<story-slug>, e.g. feature/ec3.1-pipeline-state-isolation.
  // The story slug is not the feature slug — we need the feature directory, not the story.
  // Strategy: walk up from cwd looking for artefacts/<something>/ that is the parent of a
  // file referencing this branch's story. Simpler: just return the raw segment and let the
  // caller (the SKILL.md agent) decide if it's feature-slug or story-slug.
  log(`branch → ${raw}`);
  return raw;
}

function fromCwdWalk() {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    // Look for artefacts/<slug>/ where cwd is inside or adjacent
    // Case A: cwd is inside artefacts/<slug>/... — the slug is the second segment
    const segments = dir.split(path.sep);
    const artefactsIdx = segments.lastIndexOf("artefacts");
    if (artefactsIdx >= 0 && segments.length > artefactsIdx + 1) {
      const slug = segments[artefactsIdx + 1];
      log(`cwd → inside artefacts/${slug}`);
      return slug;
    }
    // Case B: cwd is at or above repo root; try the most recent artefact folder
    const artefactsDir = path.join(dir, "artefacts");
    if (fs.existsSync(artefactsDir)) {
      // Find artefact dirs with a pipeline-state.json, pick the one with most recent mtime
      let best = null;
      let bestMtime = 0;
      for (const entry of fs.readdirSync(artefactsDir)) {
        const stateFile = path.join(artefactsDir, entry, "pipeline-state.json");
        if (fs.existsSync(stateFile)) {
          const m = fs.statSync(stateFile).mtimeMs;
          if (m > bestMtime) {
            bestMtime = m;
            best = entry;
          }
        }
      }
      if (best) {
        log(`cwd → artefacts/${best} (most-recent-mtime)`);
        return best;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  log("cwd walk: no artefacts/<slug> found");
  return null;
}

const slug = fromWorkspaceState() || fromBranchName() || fromCwdWalk();

if (!slug) {
  console.error(
    "ec3.1 slug-derivation: cannot determine current feature-slug from " +
      "workspace/state.json, branch name, or cwd walk. " +
      "Set activeFeature.slug in workspace/state.json, or run this from " +
      "a feature/<slug> branch, or from within an artefacts/<slug>/ subtree."
  );
  process.exit(1);
}

process.stdout.write(slug + "\n");
