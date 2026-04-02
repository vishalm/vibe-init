#!/bin/bash
set -euo pipefail

echo "═══════════════════════════════════════"
echo "  VIBE-INIT PRE-RELEASE CHECKS"
echo "═══════════════════════════════════════"
echo ""

# Step 1: Lint (type check)
echo "▸ Running lint (tsc --noEmit)..."
npm run lint
echo "  ✔ Lint passed"
echo ""

# Step 2: Unit tests
echo "▸ Running unit tests..."
npx vitest run tests/unit --reporter=verbose
echo "  ✔ Unit tests passed"
echo ""

# Step 3: Build
echo "▸ Building..."
npm run build
echo "  ✔ Build succeeded"
echo ""

# Step 4: Integration tests (require built CLI)
echo "▸ Running integration tests..."
npx vitest run tests/integration --reporter=verbose
echo "  ✔ Integration tests passed"
echo ""

# Step 5: Verify the built binary
echo "▸ Verifying built CLI..."
VERSION=$(node build/index.js --version)
echo "  Version: ${VERSION}"

HELP=$(node build/index.js --help 2>&1 || true)
if echo "$HELP" | grep -q "vibe init"; then
  echo "  ✔ Help text includes vibe init"
else
  echo "  ✖ Help text missing vibe init"
  exit 1
fi
if echo "$HELP" | grep -q "vibe build"; then
  echo "  ✔ Help text includes vibe build"
else
  echo "  ✖ Help text missing vibe build"
  exit 1
fi
echo ""

# Step 6: Smoke test — scan the vibe-init project itself
echo "▸ Smoke test: scanning vibe-init project..."
node build/index.js scan . > /dev/null 2>&1
echo "  ✔ Self-scan succeeded"

echo "▸ Smoke test: doctor on vibe-init project..."
node build/index.js doctor > /dev/null 2>&1
echo "  ✔ Self-doctor succeeded"
echo ""

# Step 7: Check for version consistency
echo "▸ Checking version consistency..."
PKG_VERSION=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('package.json','utf-8')).version)")
SRC_VERSION=$(grep "VERSION = " src/version.ts | sed "s/.*'\(.*\)'.*/\1/")

if [ "$PKG_VERSION" = "$SRC_VERSION" ]; then
  echo "  ✔ package.json (${PKG_VERSION}) matches src/version.ts (${SRC_VERSION})"
else
  echo "  ✖ Version mismatch: package.json=${PKG_VERSION} src/version.ts=${SRC_VERSION}"
  exit 1
fi

CLI_VERSION=$(node build/index.js --version)
if [ "$PKG_VERSION" = "$CLI_VERSION" ]; then
  echo "  ✔ CLI --version (${CLI_VERSION}) matches package.json"
else
  echo "  ✖ CLI version mismatch: CLI=${CLI_VERSION} package.json=${PKG_VERSION}"
  exit 1
fi
echo ""

echo "═══════════════════════════════════════"
echo "  ✔ ALL PRE-RELEASE CHECKS PASSED"
echo "  Ready to: npm version <patch|minor|major>"
echo "  Then:     npm publish"
echo "═══════════════════════════════════════"
