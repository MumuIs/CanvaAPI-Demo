#!/bin/bash
set -euo pipefail

# 用法: ./backup.sh "feat: 描述"  或  ./backup.sh  (自动生成描述)
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TAG="backup-${TIMESTAMP}"
DESC="${1:-Auto backup ${TIMESTAMP}}"
BACKUP_DIR="${ROOT_DIR}/backups"
ARCHIVE_NAME="${TAG}.zip"

mkdir -p "${BACKUP_DIR}"

# 确保工作区干净
cd "${ROOT_DIR}"
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[INFO] 检测到未提交更改，先提交..."
  git add .
  git commit -m "chore: ${DESC}"
fi

# 打 tag 并推送
if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  echo "[WARN] 标签 ${TAG} 已存在，追加随机后缀。"
  TAG="${TAG}-$(openssl rand -hex 3)"
fi

git tag -a "${TAG}" -m "${DESC}"

git push origin "${TAG}" || echo "[WARN] 推送 tag 失败，请稍后手动推送。"

# 生成归档（排除 .git 和 node_modules/.venv 等大目录）
zip -qr "${BACKUP_DIR}/${ARCHIVE_NAME}" . \
  -x "*/.git/*" "*/node_modules/*" "*/.venv/*" "*/.DS_Store" "backups/*"

echo "[DONE] 备份完成: ${BACKUP_DIR}/${ARCHIVE_NAME} (tag: ${TAG})"
