#!/usr/bin/env bash
set -euo pipefail

# 项目一键启动脚本：检查 Node/npm、准备 .env、安装依赖并启动电商 Demo

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
KIT_DIR="$ROOT_DIR/canva-connect-api-starter-kit"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[ERROR] $1 未安装"; exit 1; }
}

echo "[1/5] 检查 Node 与 npm 版本"
need_cmd node
need_cmd npm
NODE_V=$(node -v)
NPM_V=$(npm -v)
echo "Node: $NODE_V  npm: $NPM_V"

echo "[2/5] 准备 .env"
if [ ! -f "$KIT_DIR/.env" ]; then
  if [ -f "$KIT_DIR/.env.example" ]; then
    cp "$KIT_DIR/.env.example" "$KIT_DIR/.env"
  else
    # 自动生成与校验脚本匹配的最小可用 .env 模板
    cat > "$KIT_DIR/.env" <<'EOF'
BACKEND_PORT=3001
BACKEND_URL=http://127.0.0.1:3001
FRONTEND_URL=http://127.0.0.1:3000
BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest
BASE_CANVA_CONNECT_AUTH_URL=https://www.canva.cn/api

CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=

DATABASE_ENCRYPTION_KEY=dev-encryption-key-32-chars-12345678
EOF
  fi
  echo ""
  echo "================================================================"
  echo "[INFO] 已创建 .env 文件："
  echo "       $KIT_DIR/.env"
  echo ""
  echo "⚠️  请先填写 CANVA_CLIENT_ID 和 CANVA_CLIENT_SECRET"
  echo ""
  echo "打开方式："
  echo "  VS Code:     open -a \"Visual Studio Code\" \"$KIT_DIR/.env\""
  echo "  文本编辑:     open -e \"$KIT_DIR/.env\""
  echo ""
  echo "填写完成后，重新运行：./bootstrap.sh"
  echo "================================================================"
  echo ""
  exit 0
fi

echo "[3/5] 安装依赖 (npm ci)"
cd "$KIT_DIR"
npm ci

echo "[4/5] 启动电商 Demo (前后端)"
echo "[HINT] 首次访问前请确认 .env 中 CANVA_CLIENT_ID/SECRET 已就绪。"
npm run demo:ecommerce


