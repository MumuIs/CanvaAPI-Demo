#!/bin/bash

# 清理脚本 - 删除所有项目文件和目录

echo "开始清理项目文件..."

# 删除备份目录
if [ -d "canva-connect-api-starter-kit-backup-20251013-143902" ]; then
    echo "删除备份目录..."
    rm -rf "canva-connect-api-starter-kit-backup-20251013-143902"
fi

# 删除任何剩余的zip文件
find . -name "*.zip" -type f -delete

# 删除任何剩余的项目文件
find . -name "*.md" -type f -delete
find . -name "*.html" -type f -delete
find . -name "*.js" -type f -delete
find . -name "*.backup" -type f -delete

# 删除.DS_Store文件
find . -name ".DS_Store" -type f -delete

echo "清理完成！"
