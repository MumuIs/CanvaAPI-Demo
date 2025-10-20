#!/usr/bin/env bash
set -euo pipefail

# 项目快速更新脚本：拉取最新代码、更新依赖并重启服务

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
KIT_DIR="$ROOT_DIR/canva-connect-api-starter-kit"

echo "🔄 [1/4] 拉取最新代码"
git pull

echo "📦 [2/4] 检查并更新依赖"
cd "$KIT_DIR"
if [ -f "package-lock.json" ]; then
  echo "使用 npm ci 安装依赖..."
  npm ci
else
  echo "使用 npm install 安装依赖..."
  npm install
fi

echo "🛑 [3/4] 停止旧服务（如果存在）"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  端口 3000 未被占用"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  端口 3001 未被占用"

echo "🚀 [4/4] 启动电商 Demo"
echo ""
echo "提示：访问 http://127.0.0.1:3000 使用应用"
echo "按 Ctrl+C 可停止服务"
echo ""
npm run demo:ecommerce

