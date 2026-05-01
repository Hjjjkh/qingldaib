#!/bin/bash

echo "🚀 Cloudflare Pages 快速部署脚本"
echo ""

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 wrangler，正在安装..."
    npm install -g wrangler
fi

# 检查是否已登录
echo "📋 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请登录 Cloudflare..."
    wrangler login
fi

echo ""
echo "✅ Wrangler 已安装并登录"
echo ""

# 创建 Cloudflare 资源
echo "📦 创建 Cloudflare 资源..."
echo ""

# 创建 D1
echo "1️⃣  创建 D1 数据库..."
DATABASE_ID=$(wrangler d1 create couple-commitment-db 2>&1 | grep "database_id" | cut -d'"' -f2)
if [ -n "$DATABASE_ID" ]; then
    echo "   ✅ D1 数据库已创建：$DATABASE_ID"
else
    echo "   ⚠️  D1 数据库可能已存在，请在 Dashboard 查看 database_id"
fi

# 创建 KV
echo "2️⃣  创建 KV 命名空间..."
KV_ID=$(wrangler kv:namespace create couple-session 2>&1 | grep "id" | cut -d'"' -f2)
if [ -n "$KV_ID" ]; then
    echo "   ✅ KV 命名空间已创建：$KV_ID"
else
    echo "   ⚠️  KV 命名空间可能已存在，请在 Dashboard 查看 namespace id"
fi

# 创建 R2
echo "3️⃣  创建 R2 存储桶..."
wrangler r2 bucket create couple-photos 2>&1 | grep -q "Created" && \
    echo "   ✅ R2 存储桶已创建" || \
    echo "   ⚠️  R2 存储桶可能已存在"

echo ""
echo "📝 接下来请手动配置："
echo ""
echo "1. 访问 https://dash.cloudflare.com/"
echo "2. Workers & Pages → Create application → Pages"
echo "3. Connect to Git → 选择你的仓库"
echo "4. 配置构建："
echo "   - Framework preset: Vite"
echo "   - Build command: npm run build"
echo "   - Build output directory: frontend/dist"
echo "5. Save and Deploy"
echo ""
echo "6. 部署成功后，在 Pages 项目设置中配置绑定："
echo "   - D1 Database: DB → couple-commitment-db"
echo "   - KV Namespace: SESSION_STORE → couple-session"
echo "   - R2 Bucket: PHOTOS → couple-photos"
echo ""
echo "7. 添加环境变量 JWT_SECRET（生成随机字符串）"
echo ""
echo "8. 初始化数据库：npm run db:init"
echo ""
echo "🎉 完成！"
