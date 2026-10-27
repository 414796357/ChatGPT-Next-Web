#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-5175}"
PROXY="${PROXY:-5199}"
python3 breach_proxy.py "$PROXY" &
proxy_pid=$!
trap 'kill "$proxy_pid" 2>/dev/null || true' EXIT
python3 serve.py "$PORT"
