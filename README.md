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
# 创建 .env 并填写 8 个必填变量（不要引号/空格/中文）：
# BACKEND_PORT=3001
# BACKEND_URL=http://127.0.0.1:3001
# FRONTEND_URL=http://127.0.0.1:3000
# BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest/v1
# BASE_CANVA_CONNECT_AUTH_URL=https://www.canva.cn/api
# CANVA_CLIENT_ID=你的真实ClientId
# CANVA_CLIENT_SECRET=你的真实ClientSecret
# DATABASE_ENCRYPTION_KEY=dev-encryption-key-32-chars-12345678

npm ci
npm run demo:ecommerce
```

访问：前端 `http://127.0.0.1:3000`。首次在首页点击"连接 Canva"完成授权即可使用。

## 更新项目（同事快速拉取更新）

当项目有新版本更新时，**推荐使用一键更新脚本**：

```bash
cd CanvaAPI-Demo
./update.sh
```

该脚本会自动：
1. 拉取最新代码（`git pull`）
2. 更新依赖（`npm ci`）
3. 停止旧服务
4. 启动新服务

**或者手动更新（分步执行）：**

```bash
cd CanvaAPI-Demo

# 1. 拉取最新代码
git pull

# 2. 更新依赖（如果 package.json 有变化）
cd canva-connect-api-starter-kit
npm ci

# 3. 重启服务
# 如果服务正在运行，先停止（Ctrl+C），然后重新启动
npm run demo:ecommerce
```

**快速清理并重启（如遇到问题）：**
```bash
# 停止正在运行的服务
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# 清理并重新安装
cd canva-connect-api-starter-kit
rm -rf node_modules package-lock.json
npm install
npm run demo:ecommerce
```

## 文档

- API 概览：`docs/API_Overview.md`
- 同事快速启动（macOS）：`docs/Quickstart_mac.html`
