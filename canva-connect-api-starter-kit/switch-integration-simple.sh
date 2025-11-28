#!/usr/bin/env bash
# Canva 集成配置切换脚本（纯 bash 版本，不依赖 jq）
# 用法: ./switch-integration-simple.sh [integration1|integration2]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INTEGRATIONS_FILE="$SCRIPT_DIR/integrations.json"
ENV_FILE="$SCRIPT_DIR/.env"

# 检查 integrations.json 是否存在
if [ ! -f "$INTEGRATIONS_FILE" ]; then
  echo "❌ 错误: 找不到 integrations.json 文件"
  echo "   请确保文件存在于: $INTEGRATIONS_FILE"
  exit 1
fi

# 检查 .env 是否存在
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ 错误: 找不到 .env 文件"
  echo "   请先创建 .env 文件或运行 bootstrap.sh"
  exit 1
fi

# 简单的 JSON 解析函数（使用 grep 和 sed）
get_json_value() {
  local key="$1"
  local file="$2"
  grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$file" | sed 's/.*"\([^"]*\)".*/\1/' | head -1
}

# 如果没有提供参数，显示当前配置并提示选择
if [ $# -eq 0 ]; then
  CURRENT=$(grep -o '"current"[[:space:]]*:[[:space:]]*"[^"]*"' "$INTEGRATIONS_FILE" | sed 's/.*"\([^"]*\)".*/\1/' || echo "integration2")
  echo "📋 当前使用的集成: $CURRENT"
  echo ""
  echo "可用的集成:"
  echo "  integration1: 原始集成"
  echo "  integration2: 本地测试集成"
  echo ""
  echo "用法: ./switch-integration-simple.sh [integration1|integration2]"
  exit 0
fi

TARGET_INTEGRATION="$1"

# 验证目标集成
if [ "$TARGET_INTEGRATION" != "integration1" ] && [ "$TARGET_INTEGRATION" != "integration2" ]; then
  echo "❌ 错误: 集成 '$TARGET_INTEGRATION' 不存在"
  echo ""
  echo "可用的集成:"
  echo "  integration1: 原始集成"
  echo "  integration2: 本地测试集成"
  exit 1
fi

# 提取配置（使用简单的 grep 和 sed）
CLIENT_ID_LINE=$(grep -A 3 "\"$TARGET_INTEGRATION\"" "$INTEGRATIONS_FILE" | grep "CANVA_CLIENT_ID" | head -1)
CLIENT_SECRET_LINE=$(grep -A 3 "\"$TARGET_INTEGRATION\"" "$INTEGRATIONS_FILE" | grep "CANVA_CLIENT_SECRET" | head -1)

CLIENT_ID=$(echo "$CLIENT_ID_LINE" | sed 's/.*"CANVA_CLIENT_ID"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
CLIENT_SECRET=$(echo "$CLIENT_SECRET_LINE" | sed 's/.*"CANVA_CLIENT_SECRET"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# 检查配置是否已填写
if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "请替换为原始 Client ID" ]; then
  echo "⚠️  警告: 集成 '$TARGET_INTEGRATION' 的 Client ID 未配置"
  echo "   请编辑 integrations.json 文件填写正确的配置"
  exit 1
fi

if [ -z "$CLIENT_SECRET" ] || [ "$CLIENT_SECRET" == "请替换为原始 Client Secret" ]; then
  echo "⚠️  警告: 集成 '$TARGET_INTEGRATION' 的 Client Secret 未配置"
  echo "   请编辑 integrations.json 文件填写正确的配置"
  exit 1
fi

# 更新 .env 文件
INTEGRATION_NAME=""
if [ "$TARGET_INTEGRATION" == "integration1" ]; then
  INTEGRATION_NAME="原始集成"
else
  INTEGRATION_NAME="本地测试集成"
fi

echo "🔄 正在切换到集成: $INTEGRATION_NAME ($TARGET_INTEGRATION)..."

# 备份原 .env 文件
cp "$ENV_FILE" "$ENV_FILE.backup"

# 更新 CANVA_CLIENT_ID 和 CANVA_CLIENT_SECRET
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS 使用 sed -i ''
  sed -i '' "s/^CANVA_CLIENT_ID=.*/CANVA_CLIENT_ID=$CLIENT_ID/" "$ENV_FILE"
  sed -i '' "s/^CANVA_CLIENT_SECRET=.*/CANVA_CLIENT_SECRET=$CLIENT_SECRET/" "$ENV_FILE"
else
  # Linux 使用 sed -i
  sed -i "s/^CANVA_CLIENT_ID=.*/CANVA_CLIENT_ID=$CLIENT_ID/" "$ENV_FILE"
  sed -i "s/^CANVA_CLIENT_SECRET=.*/CANVA_CLIENT_SECRET=$CLIENT_SECRET/" "$ENV_FILE"
fi

# 更新 integrations.json 中的当前配置（使用 sed）
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/\"current\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"current\": \"$TARGET_INTEGRATION\"/" "$INTEGRATIONS_FILE"
else
  sed -i "s/\"current\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"current\": \"$TARGET_INTEGRATION\"/" "$INTEGRATIONS_FILE"
fi

echo "✅ 已切换到集成: $INTEGRATION_NAME"
echo ""
echo "📝 当前配置:"
echo "   Client ID: ${CLIENT_ID:0:20}..."
echo "   Client Secret: ${CLIENT_SECRET:0:20}..."
echo ""
echo "💡 提示: 如果服务正在运行，请重启服务以使配置生效"

