#!/usr/bin/env bash
# Starts the local preview at http://localhost:3000 using the portable
# Node toolchain in .tools/ (see README-LOCAL.md). Ctrl+C stops the server.
set -euo pipefail

cd "$(dirname "$0")/.."

NODE_DIR="$(ls -d .tools/node-*/ 2>/dev/null | head -1 || true)"
if [ -z "$NODE_DIR" ]; then
  echo "Portable Node not found in .tools/." >&2
  echo "See README-LOCAL.md for the one-time install commands." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies with bun..." >&2
  "$(pwd)/.tools/bun-windows-x64/bun.exe" install
fi

export PATH="$(pwd)/${NODE_DIR%/}:$PATH"
exec node node_modules/next/dist/bin/next dev -p 3000
