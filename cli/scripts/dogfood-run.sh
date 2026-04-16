#!/usr/bin/env bash
# ps3.3 dogfood acceptance run — installs the packaged CLI to a scratch
# prefix, creates a clean git repo, and executes the full story-unit-min
# chain end-to-end. Records wall-clock timings and emits a JSON evidence
# file that feeds the DoD artefact.
#
# Keeps the dogfood host repo clean (M1): nothing is installed *into* it.
# The CLI binary lives in a temp NPM prefix whose bin dir is put on PATH
# for the duration of the run.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../.." && pwd)"
CLI_DIR="$REPO_ROOT/cli"
EVIDENCE_DIR="${EVIDENCE_DIR:-$REPO_ROOT/workspace/dogfood-evidence}"
SCRATCH_PREFIX="$(mktemp -d -t skills-repo-dogfood-prefix.XXXXXX)"
DOGFOOD_REPO="$(mktemp -d -t skills-repo-dogfood-repo.XXXXXX)"
FIXTURE_WORK="$(mktemp -d -t skills-repo-dogfood-fixture.XXXXXX)"
FIXTURE_BARE="$(mktemp -d -t skills-repo-dogfood-fixture-bare.XXXXXX)"
SLUG="ps3-dogfood-demo"

cleanup() {
  rm -rf "$SCRATCH_PREFIX" "$DOGFOOD_REPO" "$FIXTURE_WORK" "$FIXTURE_BARE" || true
}
trap cleanup EXIT

ts_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }
ts_epoch() { date -u +%s; }

START_TS_ISO="$(ts_iso)"
START_EPOCH="$(ts_epoch)"
echo "dogfood: start=$START_TS_ISO"

# 1. Build + pack the CLI (simulates `npm publish` without needing a registry).
echo "dogfood: pack cli/"
(cd "$CLI_DIR" && npm pack --pack-destination "$SCRATCH_PREFIX" >/dev/null)
TARBALL="$(ls "$SCRATCH_PREFIX"/skills-repo-*.tgz | head -1)"
echo "dogfood: tarball=$TARBALL"

# 2. Install the tarball into a scratch prefix.
mkdir -p "$SCRATCH_PREFIX/install"
npm install -g --silent --prefix "$SCRATCH_PREFIX/install" "$TARBALL" >/dev/null
export PATH="$SCRATCH_PREFIX/install/bin:$PATH"
which skills-repo
skills-repo --help >/dev/null

# 3. Build a local fixture git repo (stand-in for a public source).
(cd "$FIXTURE_WORK" && \
  git init -q -b main && \
  git config user.email "fx@fx" && git config user.name "fx" && \
  mkdir -p skills standards && \
  cat > skills/definition.md <<EOF
# skill: definition
Drive discovery conversationally.
EOF
  cat > skills/test-plan.md <<EOF
# skill: test-plan
Write failing tests.
EOF
  cat > skills/definition-of-ready.md <<EOF
# skill: dor
Hard-block check before inner loop.
EOF
  cat > skills/definition-of-done.md <<EOF
# skill: dod
Post-merge AC coverage check.
EOF
  cat > standards/core.md <<EOF
# core standards
Test-driven; no credentials in tracked files.
EOF
  git add -A && git commit -q -m "dogfood fixture" && \
  git tag v0.0.1)
git clone --bare -q "$FIXTURE_WORK" "$FIXTURE_BARE"
SRC_URL="file://$FIXTURE_BARE"
SRC_REF="v0.0.1"

# 4. Create the dogfood host repo + run the full chain.
(cd "$DOGFOOD_REPO" && git init -q && \
  git config user.email "op@op" && git config user.name "op")

INIT_START="$(ts_epoch)"
(cd "$DOGFOOD_REPO" && skills-repo init --yes "--source=$SRC_URL" "--ref=$SRC_REF" >/dev/null)
INIT_END="$(ts_epoch)"

(cd "$DOGFOOD_REPO" && skills-repo artefact new "$SLUG" >/dev/null)

# Progress each non-external step by simulating operator completion —
# the scaffold file is written by `run next`; we overwrite it with a
# "done" line so the resolver treats it as complete on the next call.
run_step() {
  local step="$1"
  local produces="$2"
  (cd "$DOGFOOD_REPO" && skills-repo run next)
  # Overwrite the scaffold with a short "done" body so the next run
  # advances.
  echo "# $step — completed by dogfood script" > "$DOGFOOD_REPO/artefacts/$SLUG/$produces"
}

run_step "definition" "definition.md"
FIRST_ARTEFACT_EPOCH="$(ts_epoch)"
run_step "test-plan" "test-plan.md"
run_step "definition-of-ready" "dor.md"

# external step
set +e
(cd "$DOGFOOD_REPO" && skills-repo run next)
EXT_CODE=$?
set -e
[[ "$EXT_CODE" == "2" ]] || { echo "expected exit 2 on external step; got $EXT_CODE"; exit 1; }
(cd "$DOGFOOD_REPO" && skills-repo artefact "$SLUG" mark-step-done implement >/dev/null)

run_step "definition-of-done" "dod.md"
(cd "$DOGFOOD_REPO" && skills-repo run next >/dev/null)  # should report workflow complete

END_EPOCH="$(ts_epoch)"
END_TS_ISO="$(ts_iso)"

# 5. Cleanliness check (M1).
GIT_STATUS_OUT="$(cd "$DOGFOOD_REPO" && git status --porcelain)"
VIOLATIONS="$(echo "$GIT_STATUS_OUT" | awk '{print $2}' | grep -Ev '^(\.skills-repo|artefacts|\.gitignore)' || true)"
if [[ -n "$VIOLATIONS" ]]; then
  echo "❌ M1 violation — paths outside sidecar/artefacts:"
  echo "$VIOLATIONS"
  exit 2
fi

# 6. Write evidence.
mkdir -p "$EVIDENCE_DIR"
INIT_SECS=$((INIT_END - INIT_START))
FIRST_ART_SECS=$((FIRST_ARTEFACT_EPOCH - START_EPOCH))
TOTAL_SECS=$((END_EPOCH - START_EPOCH))
cat > "$EVIDENCE_DIR/run-$(date -u +%Y%m%d-%H%M%S).json" <<EOF
{
  "start": "$START_TS_ISO",
  "end": "$END_TS_ISO",
  "totalSeconds": $TOTAL_SECS,
  "initSeconds": $INIT_SECS,
  "timeToFirstArtefactSeconds": $FIRST_ART_SECS,
  "dogfoodRepoPath": "$DOGFOOD_REPO",
  "slug": "$SLUG",
  "source": "$SRC_URL",
  "ref": "$SRC_REF",
  "stepsCompleted": ["definition","test-plan","definition-of-ready","implement","definition-of-done"],
  "m1SidecarFootprint": "pass",
  "m2TimeToFirstArtefactSeconds": $FIRST_ART_SECS,
  "cliHash": "$(shasum -a 256 "$TARBALL" | awk '{print $1}')"
}
EOF

# 7. Copy the dogfood repo's .skills-repo/traces into the evidence dir.
cp -R "$DOGFOOD_REPO/.skills-repo/traces" "$EVIDENCE_DIR/traces-$(date -u +%Y%m%d-%H%M%S)"

echo "✅ dogfood acceptance complete"
echo "   init: ${INIT_SECS}s"
echo "   time-to-first-artefact: ${FIRST_ART_SECS}s (M2 target: <900s, min: <1800s)"
echo "   total: ${TOTAL_SECS}s"
echo "   evidence: $EVIDENCE_DIR"
