#!/usr/bin/env bash
set -euo pipefail

# Usage check
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <source-repo-url> <destination-repo-url>"
  exit 1
fi

SRC_REPO="$1"
DST_REPO="$2"

# Create a temporary directory
TMPDIR="$(mktemp -d)"
echo "→ Cloning (mirror) $SRC_REPO into $TMPDIR"
git clone --mirror "$SRC_REPO" "$TMPDIR"

cd "$TMPDIR"

# Remove old origin, add new one
echo "→ Setting destination remote to $DST_REPO"
git remote remove origin
git remote add origin "$DST_REPO"

# Push everything
echo "→ Pushing all refs to $DST_REPO"
git push --mirror origin

cd - >/dev/null

# Cleanup
rm -rf "$TMPDIR"
echo "✔ Migration complete!"