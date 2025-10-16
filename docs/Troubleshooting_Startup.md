# 启动失败排查手册（macOS + .env）

本页汇总同事环境中遇到的启动报错与修复方案，适用于 CanvaAPI-Demo 电商 Demo 的一键启动与手动启动。

## 0. 已验证的完整修复步骤（推荐直接按此操作）

### 问题根因
- .env 必填变量不匹配源码校验（变量名错误/缺项/值含空格中文）
- BASE_CANVA_CONNECT_API_URL 少了 /v1
- CANVA_CLIENT_ID/SECRET 值有前后空格或被截断

### 5 步修复（已在本机验证通过）

**1) 拉最新代码（已修复 start.ts 显式加载 .env）**
```bash
cd ~/CanvaAPI-Demo  # 或你的项目目录
git pull
```

**2) 确保使用 Node 20（避免 Node 22 兼容性问题）**
```bash
nvm use 20  # 或 nvm install 20 && nvm use 20
node -v     # 确认 v20.x
```

**3) 编辑 .env（8 个必填变量，严格按模板填写）**
```bash
cd ~/CanvaAPI-Demo/canva-connect-api-starter-kit
open -e .env
```

模板（复制粘贴，替换为真实凭据，**不加引号/空格/中文**）：
```env
BACKEND_PORT=3001
BACKEND_URL=http://127.0.0.1:3001
FRONTEND_URL=http://127.0.0.1:3000
BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest/v1
BASE_CANVA_CONNECT_AUTH_URL=https://www.canva.cn/api

CANVA_CLIENT_ID=粘贴完整ClientId
CANVA_CLIENT_SECRET=粘贴完整ClientSecret

DATABASE_ENCRYPTION_KEY=dev-encryption-key-32-chars-12345678
```

关键点：
- `BASE_CANVA_CONNECT_API_URL` 必须带 `/v1`；`BASE_CANVA_CONNECT_AUTH_URL` 必须带 `/api`（非中国区用 canva.com）
- `CANVA_CLIENT_ID/SECRET` 值前后不要有空格、不要有中文、不要加引号
- 变量名必须完全一致（如 `BACKEND_PORT` 不能写成 `PORT`）

**4) 清理隐藏字符（可选但推荐）**
```bash
LC_ALL=C tr -d '\r' < .env | sed '1s/^\xEF\xBB\xBF//' > /tmp/.env.clean && mv /tmp/.env.clean .env
```

**5) 关闭旧 Demo 进程（避免端口占用）并启动**
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

npm run demo:ecommerce
```

### 验证成功
- 终端显示 "Ecommerce shop backend listening on port 3001"
- 浏览器访问 http://127.0.0.1:3000

---

## 1. 常见症状

- 启动脚本报错（统一落在 ts-node 启动时）：
  ```text
  npm error Lifecycle script `start` failed with error
  npm error command sh -c ts-node ./scripts/start.ts
  ```
- 环境变量占位/缺失：
  ```text
  Error: Placeholder environment variable for 'CANVA_CLIENT_ID' detected.
  ```
- macOS 15 + Homebrew 安装 Node 提示不支持（可忽略 Brew，改用 nvm/官网包）：
  ```text
  Warning: You are using macOS 15. We do not provide support for this pre-release version...
  Error: unknown or unsupported macOS version: :dunno
  ```

## 2. 环境要求

- Node.js 20（或 18）与 npm 9+（建议 Node 20）
- macOS 15 如 Brew 报不支持，使用 nvm 或官网安装包

## 3. 必填环境变量（以源码校验为准）
校验文件：`canva-connect-api-starter-kit/demos/common/scripts/env.ts`

必须 8 项（变量名必须完全一致）：
```env
BACKEND_PORT=3001
BACKEND_URL=http://127.0.0.1:3001
FRONTEND_URL=http://127.0.0.1:3000
BASE_CANVA_CONNECT_API_URL=https://api.canva.cn/rest/v1  # 非中国区用 https://api.canva.com/rest/v1
BASE_CANVA_CONNECT_AUTH_URL=https://www.canva.cn/api    # 非中国区用 https://www.canva.com/api

CANVA_CLIENT_ID=你的真实ClientId（完整、不加引号/空格）
CANVA_CLIENT_SECRET=你的真实ClientSecret（完整、不加引号/空格）

DATABASE_ENCRYPTION_KEY=dev-encryption-key-32-chars-12345678  # 任意非空随机串，建议≥32字符
```

注意：`BASE_CANVA_CONNECT_API_URL` 必须带 `/v1`；`BASE_CANVA_CONNECT_AUTH_URL` 必须带 `/api`。

## 4. 快速修复步骤

1) 确保 `.env` 位置正确且仅一份
```bash
cd ~/CanvaAPI-Demo
/usr/bin/find canva-connect-api-starter-kit -maxdepth 2 -name ".env*" -print
```

2) 打开并填写 7 个必填项
```bash
open -e canva-connect-api-starter-kit/.env
```

3) 清理隐藏字符（CRLF/BOM）防止解析失败（可选但推荐）
```bash
LC_ALL=C tr -d '\r' < canva-connect-api-starter-kit/.env | sed '1s/^\xEF\xBB\xBF//' > /tmp/.env.clean && mv /tmp/.env.clean canva-connect-api-starter-kit/.env
```

4) 自检值是否被正确读取（不依赖全局 dotenv）
```bash
node -e "require('./canva-connect-api-starter-kit/node_modules/dotenv').config({path:'canva-connect-api-starter-kit/.env'});const r=v=>({len:(v||'').length,head:(v||'').slice(0,8)});console.log({ID:r(process.env.CANVA_CLIENT_ID),SECRET:r(process.env.CANVA_CLIENT_SECRET)})"
```
- 若 `len` 很小或为 0，说明为空/被截断/有隐藏字符，需从后台重新完整复制。

5) 重启
```bash
cd ~/CanvaAPI-Demo/canva-connect-api-starter-kit
npm run demo:ecommerce
```

## 5. Node 安装（macOS 15 避开 Brew）

- nvm（推荐）
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20 && nvm use 20
node -v && npm -v
```
- 官方安装包
  - 访问 https://nodejs.org 下载 macOS 20.x LTS 安装包（Apple Silicon/Intel 对应架构）

## 6. 一键脚本（bootstrap.sh）行为说明

- 若缺少 `.env`，脚本会自动在 `canva-connect-api-starter-kit/.env` 生成满足校验的最小模板，并提示你先填写 `CANVA_CLIENT_ID/SECRET` 后再执行脚本。

## 7. 标准诊断命令清单

```bash
# 仅列出 .env 路径，确认唯一
/usr/bin/find canva-connect-api-starter-kit -maxdepth 2 -name ".env*" -print

# 检查 BASE_CANVA_CONNECT_API_URL 是否带 /v1
grep '^BASE_CANVA_CONNECT_API_URL=' canva-connect-api-starter-kit/.env

# 检查 ID/SECRET 被读取的长度与前缀（隐去完整值）
node -e "require('./canva-connect-api-starter-kit/node_modules/dotenv').config({path:'canva-connect-api-starter-kit/.env'});const r=v=>({len:(v||'').length,head:(v||'').slice(0,8)});console.log({ID:r(process.env.CANVA_CLIENT_ID),SECRET:r(process.env.CANVA_CLIENT_SECRET)})"
```

## 8. 常见错误对照

- Placeholder environment variable…：
  - 原因：值为空、仍为占位 `<VAR>`、复制被截断、含隐藏字符
- Cannot find module 'dotenv'：
  - 仅在你用 `node -e "require('dotenv')"` 自检时报，全局没装；不影响项目。用上面的“项目内依赖路径”命令即可
- BASE_CANVA_CONNECT_API_URL 缺 `/v1`：
  - 必须为 `.../rest/v1`

---
若仍无法启动，请提供以下输出（可隐去中间字符）：
- `.env` 路径列表（find 命令输出）
- ID/SECRET 自检的 `{ len, head }` 输出
- 完整启动报错（从 `ts-node ./scripts/start.ts` 开始）
