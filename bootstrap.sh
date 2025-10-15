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
    # 填入常用默认值，如有需要由使用者修改
    sed -i '' 's|^PORT=.*$|PORT=3001|' "$KIT_DIR/.env" || true
    sed -i '' 's|^BACKEND_URL=.*$|BACKEND_URL=http://127.0.0.1:3001|' "$KIT_DIR/.env" || true
    sed -i '' 's|^BASE_CANVA_CONNECT_API_URL=.*$|BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest/v1|' "$KIT_DIR/.env" || true
    echo "[INFO] 已生成默认 .env，请根据你的凭据更新 CANVA_CLIENT_ID / CANVA_CLIENT_SECRET。"
  else
    echo "[ERROR] 缺少 $KIT_DIR/.env.example"
    exit 1
  fi
fi

echo "[3/5] 安装依赖 (npm ci)"
cd "$KIT_DIR"
npm ci

echo "[4/5] 启动电商 Demo (前后端)"
echo "[HINT] 首次访问前请确认 .env 中 CANVA_CLIENT_ID/SECRET 已就绪。"
npm run demo:ecommerce


