# CanvaAPI-Demo 快速启动

## 一键启动（推荐给同事）

要求：Node.js 20（或 18）与 npm 9+、Git。

```bash
# 克隆并进入项目
git clone git@github.com:MumuIs/CanvaAPI-Demo.git
cd CanvaAPI-Demo

# 运行一键脚本（首次会生成 canva-connect-api-starter-kit/.env）
./bootstrap.sh
```

提示：首次运行前，请在 `canva-connect-api-starter-kit/.env` 中填好你的 `CANVA_CLIENT_ID` 与 `CANVA_CLIENT_SECRET`。

## 手动启动（可选）

```bash
cd canva-connect-api-starter-kit
cp .env.example .env
# 编辑 .env：
# PORT=3001
# BACKEND_URL=http://127.0.0.1:3001
# BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest/v1
# CANVA_CLIENT_ID=xxx
# CANVA_CLIENT_SECRET=yyy
# WEBHOOK_SECRET=dev-secret

npm ci
npm run demo:ecommerce
```

访问：前端 `http://127.0.0.1:3000`。首次在首页点击“连接 Canva”完成授权即可使用。
