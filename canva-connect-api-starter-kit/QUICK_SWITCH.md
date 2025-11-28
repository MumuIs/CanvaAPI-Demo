# ⚡ 快速切换集成

## 一步切换

```bash
# 切换到本地测试集成（integration2）
./switch-integration-simple.sh integration2

# 切换到原始集成（integration1）
./switch-integration-simple.sh integration1
```

## ⚠️ 首次使用

1. 编辑 `integrations.json`，将 `integration1` 的配置替换为您的原始集成信息
2. 运行切换脚本
3. 重启服务：`npm run demo:ecommerce`

## 📝 当前配置

查看当前使用的集成：
```bash
./switch-integration-simple.sh
```

