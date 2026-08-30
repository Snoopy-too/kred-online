#!/usr/bin/env bash
set -eo pipefail

# Ensure standard binaries and local node_modules binaries are in PATH
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$REPO_DIR/webhook.log"

exec >> "$LOG_FILE" 2>&1

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Target branch (default: current branch or kred2.0)
TARGET_BRANCH="${1:-}"
if [ -z "$TARGET_BRANCH" ]; then
  cd "$REPO_DIR"
  TARGET_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "kred2.0")
fi

# Clean up ref format (e.g. refs/heads/kred2.0 -> kred2.0)
TARGET_BRANCH="${TARGET_BRANCH#refs/heads/}"

log "========================================================"
log "🚀 Starting KRED automated sync for branch: $TARGET_BRANCH"
log "📂 Repository path: $REPO_DIR"

cd "$REPO_DIR"

# Ensure safe git directory
git config --global --add safe.directory "$REPO_DIR" 2>/dev/null || true

log "📥 Fetching latest commits from origin..."
git fetch origin "$TARGET_BRANCH" || git fetch origin

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [ -n "$CURRENT_BRANCH" ] && [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  log "🔀 Switching from $CURRENT_BRANCH to $TARGET_BRANCH..."
  git checkout "$TARGET_BRANCH" 2>/dev/null || git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH"
fi

log "🔄 Resetting working tree to origin/$TARGET_BRANCH..."
git reset --hard "origin/$TARGET_BRANCH"

LATEST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %cr)")
log "📌 Current commit at HEAD: $LATEST_COMMIT"

log "📦 Updating npm dependencies (including devDependencies)..."
NODE_ENV=development npm install --include=dev --no-audit --no-fund --prefer-offline

# Add local node_modules/.bin to PATH for vite / esbuild
export PATH="$REPO_DIR/node_modules/.bin:$PATH"

log "🔨 Building KRED game module bundle..."
if [ -f "$REPO_DIR/scripts/build-server-game.mjs" ]; then
  node "$REPO_DIR/scripts/build-server-game.mjs"
fi

if [ -f "$REPO_DIR/scripts/build-module.mjs" ]; then
  node "$REPO_DIR/scripts/build-module.mjs"
elif npm run | grep -q "build:module"; then
  npm run build:module
else
  npx vite build
fi

log "🔄 Restarting tfd-lobby in PM2..."
pm2 restart tfd-lobby || true

log "✅ KRED sync completed successfully!"
log "========================================================"
