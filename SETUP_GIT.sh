#!/bin/sh
# 这是一个用于初始化项目并将其连接到新的 GitHub 仓库的设置脚本。

# 如果任何命令失败，则退出脚本。
set -e

# --- 第 0 步：检查输入参数 ---
if [ -z "$1" ]; then
  echo "❌ 错误：缺少 GitHub 仓库 URL。"
  echo "请按以下格式提供您的仓库 URL 作为参数："
  echo "   sh ./SETUP_GIT.sh \"https://github.com/YourUsername/YourRepositoryName.git\""
  exit 1
fi
NEW_REMOTE_URL="$1"


# --- 第 1 步：清理旧的 Git 配置 ---
echo "正在清理旧的 Git 配置..."
# 删除可能存在的旧 .git 文件夹，以确保我们从一个完全干净的状态开始。
rm -rf .git
echo "清理完成。"
echo "\n"


# --- 第 2 步：初始化新的 Git 仓库 ---
echo "正在初始化新的本地 Git 仓库..."
git init -b main # 初始化并创建主分支 'main'
echo "初始化完成。"
echo "\n"


# --- 第 3 步：关联到新的远程仓库 ---
echo "正在关联到新的远程仓库: $NEW_REMOTE_URL"
git remote add origin "$NEW_REMOTE_URL"
echo "关联成功。"
echo "\n"


# --- 第 4 步：添加所有文件并创建首次提交 ---
echo "正在将所有项目文件添加到仓库..."
git add .
echo "正在创建初始提交..."
git commit -m "Initial commit: Project setup from Firebase Studio"
echo "首次提交已创建。"
echo "\n\n"


# --- 第 5 步：完成！---
echo "========================================================================"
echo "✅ 本地仓库已设置完毕并与您的新 GitHub 仓库关联！"
echo ""
echo "下一步，请在终端手动运行以下命令来将您的代码首次推送到 GitHub："
echo "\n"
echo "    git push -u origin main"
echo "\n"
echo "这个命令会将您的代码上传到您的仓库，并设置 main 分支为默认跟踪分支。"
echo "========================================================================"
