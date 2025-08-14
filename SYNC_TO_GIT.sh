#!/bin/sh
# 这是一个将您当前的项目更改同步到 GitHub 的脚本。

# 退出脚本，如果任何命令失败。
set -e

# === 脚本开始 ===
echo "🚀 开始将当前更改同步到 Git..."

# 1. 将所有当前文件夹中的更改（新增、修改、删除）添加到暂存区
echo "正在添加所有文件更改..."
git add .

# 2. 获取提交信息
if [ -z "$1" ]; then
  echo "请输入本次更新的描述信息 (例如: '修复了bug' 或 '添加了新功能')，然后按 Enter:"
  read COMMIT_MESSAGE
else
  COMMIT_MESSAGE="$1"
fi

# 如果没有输入任何信息，提供一个默认值
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Sync: Update project files"
  echo "未提供描述，使用默认信息: '$COMMIT_MESSAGE'"
fi

# 3. 创建一个新的提交
echo "正在创建新的提交..."
git commit -m "$COMMIT_MESSAGE"
echo "提交已创建！"


echo "\n\n"
echo "========================================================================"
echo "✅ 本地提交已成功创建！"
echo ""
echo "下一步，请在终端手动运行以下命令来将您的提交推送到 GitHub："
echo "\n"
echo "    git push"
echo "\n"
echo "这个命令会将您刚刚创建的“存档点”上传到您的 GitHub 仓库。"
echo "========================================================================"
