# CanvaAPI-Demo 快速启动

## 一键启动（推荐给同事）

要求：Node.js 20（或 18）与 npm 9+、Git。
macOS 15 上如 Homebrew 提示不支持，可改用 nvm 安装或官网下载包：
```bash
# A) 使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20 && nvm use 20

# B) 官方安装包
# 访问 https://nodejs.org 下载 macOS 20 LTS 并安装
```

```bash
# 推荐：使用 SSH 克隆（先在 GitHub 添加你的公钥）
git clone git@github.com:MumuIs/CanvaAPI-Demo.git
cd CanvaAPI-Demo

# 若使用 HTTPS 遇到 credential 报错，可执行：
git config --global --unset-all credential.helper
git config --global credential.helper osxkeychain

# 一键脚本（首次会生成 canva-connect-api-starter-kit/.env）
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

## 文档

- API 概览：`docs/API_Overview.md`
- 同事快速启动（macOS）：`docs/Quickstart_mac.html`
