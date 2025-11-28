#!/usr/bin/env bash
# Canva 集成配置切换脚本
# 用法: ./switch-integration.sh [integration1|integration2]

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

# 如果没有提供参数，显示当前配置并提示选择
if [ $# -eq 0 ]; then
  CURRENT=$(jq -r '.current' "$INTEGRATIONS_FILE" 2>/dev/null || echo "integration2")
  echo "📋 当前使用的集成: $CURRENT"
  echo ""
  echo "可用的集成:"
  jq -r '.integrations | to_entries[] | "  \(.key): \(.value.name)"' "$INTEGRATIONS_FILE"
  echo ""
  echo "用法: ./switch-integration.sh [integration1|integration2]"
  exit 0
fi

TARGET_INTEGRATION="$1"

# 验证目标集成是否存在
INTEGRATION_EXISTS=$(jq -r ".integrations | has(\"$TARGET_INTEGRATION\")" "$INTEGRATIONS_FILE")
if [ "$INTEGRATION_EXISTS" != "true" ]; then
  echo "❌ 错误: 集成 '$TARGET_INTEGRATION' 不存在"
  echo ""
  echo "可用的集成:"
  jq -r '.integrations | to_entries[] | "  \(.key): \(.value.name)"' "$INTEGRATIONS_FILE"
  exit 1
fi

# 读取集成配置
CLIENT_ID=$(jq -r ".integrations[\"$TARGET_INTEGRATION\"].CANVA_CLIENT_ID" "$INTEGRATIONS_FILE")
CLIENT_SECRET=$(jq -r ".integrations[\"$TARGET_INTEGRATION\"].CANVA_CLIENT_SECRET" "$INTEGRATIONS_FILE")
INTEGRATION_NAME=$(jq -r ".integrations[\"$TARGET_INTEGRATION\"].name" "$INTEGRATIONS_FILE")

# 检查配置是否已填写
if [ "$CLIENT_ID" == "请替换为原始 Client ID" ] || [ -z "$CLIENT_ID" ]; then
  echo "⚠️  警告: 集成 '$TARGET_INTEGRATION' 的 Client ID 未配置"
  echo "   请编辑 integrations.json 文件填写正确的配置"
  exit 1
fi

if [ "$CLIENT_SECRET" == "请替换为原始 Client Secret" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "⚠️  警告: 集成 '$TARGET_INTEGRATION' 的 Client Secret 未配置"
  echo "   请编辑 integrations.json 文件填写正确的配置"
  exit 1
fi

# 更新 .env 文件
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

# 更新 integrations.json 中的当前配置
jq ".current = \"$TARGET_INTEGRATION\"" "$INTEGRATIONS_FILE" > "$INTEGRATIONS_FILE.tmp" && mv "$INTEGRATIONS_FILE.tmp" "$INTEGRATIONS_FILE"

echo "✅ 已切换到集成: $INTEGRATION_NAME"
echo ""
echo "📝 当前配置:"
echo "   Client ID: ${CLIENT_ID:0:20}..."
echo "   Client Secret: ${CLIENT_SECRET:0:20}..."
echo ""
echo "💡 提示: 如果服务正在运行，请重启服务以使配置生效"

