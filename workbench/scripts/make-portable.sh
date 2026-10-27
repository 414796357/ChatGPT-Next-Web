#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
out="${HOME}/Desktop/投监工作台-迁移包.tar.gz"
if [ ! -d "$(dirname "$out")" ]; then
  out="$(pwd)/投监工作台-迁移包.tar.gz"
fi
tar --exclude='config.local.json' --exclude='ia_cred.local.json' \
    --exclude='__pycache__' --exclude='.DS_Store' \
    -czf "$out" .
echo "wrote $out"
