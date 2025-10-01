#!/usr/bin/env bash
set -euo pipefail

echo "[1/5] Checking Codex CLI..." >&2
if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI not found in PATH. Install via npm (e.g., npm i -g @codex/cli) and retry." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_JS="$SCRIPT_DIR/clipboard-server.js"

echo "[2/5] Ensuring MCP JS SDK is installed (local to mcp/)..." >&2
npm --prefix "$SCRIPT_DIR" install @modelcontextprotocol/sdk

echo "[3/5] Registering MCP server with Codex (idempotent)..." >&2
if codex mcp get clipboard >/dev/null 2>&1; then
  echo "MCP server 'clipboard' already configured. Skipping add." >&2
else
  codex mcp add clipboard -- node "$SERVER_JS"
fi

echo "[4/5] Verifying configured MCP servers..." >&2
codex mcp list || true

if [ "$(node -p 'process.platform')" = "linux" ]; then
  if ! command -v xclip >/dev/null 2>&1 && ! command -v xsel >/dev/null 2>&1; then
    echo "[!] Linux detected: neither xclip nor xsel found. Install one for clipboard to work:" >&2
    echo "    sudo apt-get install -y xclip    # Debian/Ubuntu" >&2
    echo "    sudo yum install -y xclip        # RHEL/CentOS/Fedora" >&2
    echo "    sudo pacman -S xclip             # Arch" >&2
  fi
fi

echo "[5/5] Done. In Codex sessions, tools 'read_clipboard', 'write_clipboard', 'clear_clipboard', and 'clipboard_info' will be available." >&2
