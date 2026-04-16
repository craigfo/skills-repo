#!/usr/bin/env node
/**
 * scripts/build-pipeline-state.js — ec3.1 scanner (AC2).
 *
 * Walks artefacts/<slug>/pipeline-state.json files, unions their
 * features, orders by updatedAt desc, and writes the derived aggregate
 * to .github/pipeline-state.derived.json. The root .github/pipeline-state.json
 * is never read or written by this script (per AC1).
 *
 * Usage:
 *   node scripts/build-pipeline-state.js [repoRoot]
 *
 * Exits 0 on success. Exits 1 if the artefacts/ directory is absent.
 * Malformed per-artefact JSON files are skipped with a warning on stderr
 * (does not halt the whole run — per test plan NFR: backward readability).
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || process.cwd();
const ARTEFACTS_DIR = path.join(ROOT, "artefacts");
const OUTPUT_PATH = path.join(ROOT, ".github/pipeline-state.derived.json");

if (!fs.existsSync(ARTEFACTS_DIR)) {
  console.error(`build-pipeline-state: no artefacts/ directory at ${ARTEFACTS_DIR}`);
  process.exit(1);
}

const features = [];
for (const entry of fs.readdirSync(ARTEFACTS_DIR)) {
  const dir = path.join(ARTEFACTS_DIR, entry);
  try {
    if (!fs.statSync(dir).isDirectory()) continue;
  } catch (_err) {
    continue;
  }
  const statePath = path.join(dir, "pipeline-state.json");
  if (!fs.existsSync(statePath)) continue;
  let content;
  try {
    content = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch (err) {
    console.error(`build-pipeline-state: skipping malformed ${statePath} — ${err.message}`);
    continue;
  }
  // Tolerate two input shapes:
  // (1) a full state.json with features[] (legacy/aggregate shape)
  // (2) a single-feature object at the top level (per-artefact shape post-ec3.1)
  if (Array.isArray(content.features)) {
    features.push(...content.features);
  } else if (content.slug) {
    features.push(content);
  } else {
    console.error(`build-pipeline-state: skipping ${statePath} — neither features[] nor top-level slug`);
  }
}

features.sort((a, b) => {
  const aTime = a.updatedAt || "";
  const bTime = b.updatedAt || "";
  return bTime.localeCompare(aTime);
});

const derived = {
  version: "1",
  updated: new Date().toISOString(),
  derivedFrom: "scanner",
  sourcePaths: features.map((f) => `artefacts/${f.slug}/pipeline-state.json`),
  features,
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(derived, null, 2) + "\n");
console.log(
  `build-pipeline-state: ${features.length} feature${features.length === 1 ? "" : "s"} → ${OUTPUT_PATH}`
);
