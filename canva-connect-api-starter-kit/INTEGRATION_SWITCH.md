# Canva 集成配置切换指南

本工具允许您在多个 Canva 集成之间快速切换，方便本地测试和开发。

## 🚀 快速开始

### 1. 配置集成信息

编辑 `integrations.json` 文件，填写您的两个集成配置：

```json
{
  "integrations": {
    "integration1": {
      "name": "原始集成",
      "CANVA_CLIENT_ID": "您的原始 Client ID",
      "CANVA_CLIENT_SECRET": "您的原始 Client Secret"
    },
    "integration2": {
      "name": "本地测试集成",
      "CANVA_CLIENT_ID": "请替换为本地测试 Client ID",
      "CANVA_CLIENT_SECRET": "请替换为本地测试 Client Secret"
    }
  },
  "current": "integration2"
}
```

**⚠️ 重要**: 请将 `integration1` 中的 `"请替换为原始 Client ID"` 和 `"请替换为原始 Client Secret"` 替换为您实际的原始集成配置。

### 2. 切换集成

我们提供了两个脚本版本：

#### 版本 A: `switch-integration.sh` (需要 jq)
```bash
# 查看当前配置和可用集成
./switch-integration.sh

# 切换到 integration1（原始集成）
./switch-integration.sh integration1

# 切换到 integration2（本地测试集成）
./switch-integration.sh integration2
```

**注意**: 此版本需要安装 `jq`。如果未安装，请使用版本 B。

#### 版本 B: `switch-integration-simple.sh` (纯 bash，推荐)
```bash
# 查看当前配置和可用集成
./switch-integration-simple.sh

# 切换到 integration1（原始集成）
./switch-integration-simple.sh integration1

# 切换到 integration2（本地测试集成）
./switch-integration-simple.sh integration2
```

**推荐使用版本 B**，因为它不依赖任何外部工具。

### 3. 重启服务

切换配置后，如果服务正在运行，需要重启服务以使新配置生效：

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
npm run demo:ecommerce
```

## 📋 工作原理

1. **integrations.json**: 存储所有集成的配置信息
2. **switch-integration*.sh**: 读取配置并更新 `.env` 文件中的 `CANVA_CLIENT_ID` 和 `CANVA_CLIENT_SECRET`
3. **.env**: 实际使用的配置文件，由脚本自动更新
4. **.env.backup**: 切换前自动创建的备份文件

## ⚠️ 注意事项

- 切换前会自动备份 `.env` 文件为 `.env.backup`
- 请确保 `integrations.json` 中的配置信息正确
- **切换后需要重启服务才能生效**
- `integrations.json` 包含敏感信息，建议添加到 `.gitignore`（如果不需要版本控制）

## 💡 使用示例

```bash
# 1. 切换到本地测试集成
cd canva-connect-api-starter-kit
./switch-integration-simple.sh integration2

# 2. 重启服务（如果正在运行）
# 按 Ctrl+C 停止，然后：
npm run demo:ecommerce

# 3. 需要切换回原始集成时
./switch-integration-simple.sh integration1
# 再次重启服务
```

## 添加更多集成

在 `integrations.json` 中添加新的集成配置：

```json
{
  "integrations": {
    "integration1": { ... },
    "integration2": { ... },
    "integration3": {
      "name": "新集成名称",
      "CANVA_CLIENT_ID": "新的 Client ID",
      "CANVA_CLIENT_SECRET": "新的 Client Secret"
    }
  }
}
```

然后使用 `./switch-integration.sh integration3` 切换。

