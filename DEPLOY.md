# 快速部署指南

## 🚀 5 分钟上线你的情侣约定网站

### 方式一：使用 Deploy Button（推荐）

1. 点击 README 顶部的 **[Deploy to Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github)** 按钮
2. 授权 Cloudflare 访问 GitHub
3. 选择你的仓库
4. 按下面的步骤配置即可

### 方式二：手动部署

#### Step 1: 推送到 GitHub

```bash
cd /workspace

# 初始化 git
git init
git add .
git commit -m "Initial commit: couple commitment tracker"

# 在 GitHub 创建仓库（https://github.com/new）
# 然后推送：
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

#### Step 2: 连接 Cloudflare Pages

1. 访问：https://dash.cloudflare.com/
2. **Workers & Pages** → **Create application** → **Pages**
3. **Connect to Git**
4. 授权并选择你的仓库
5. **Begin setup**

#### Step 3: 配置构建

| 配置 | 值 |
|------|-----|
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `frontend/dist` |
| Root directory | `/` |
| Node version | `18` |

点击 **Save and Deploy**

#### Step 4: 创建 Cloudflare 资源

打开终端执行：

```bash
# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create couple-commitment-db
# 记录：database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 创建 KV 命名空间
wrangler kv:namespace create couple-session
# 记录：id = "yyyyyyyyyyyyyyyyyyyyyyyy"

# 创建 R2 存储桶
wrangler r2 bucket create couple-photos
```

#### Step 5: 配置绑定

在 Pages 项目页面：

1. **Settings** → **Functions** → **Function bindings**
2. 添加 3 个绑定：

```
1. D1 Database
   - Variable name: DB
   - Database: couple-commitment-db

2. KV Namespace
   - Variable name: SESSION_STORE
   - KV namespace: couple-session

3. R2 Bucket
   - Variable name: PHOTOS
   - Bucket: couple-photos
```

3. **Save and Deploy**

#### Step 6: 添加环境变量

1. **Settings** → **Environment variables**
2. **Add variable**

```
Variable name: JWT_SECRET
Value: (运行) openssl rand -hex 32
```

#### Step 7: 初始化数据库

```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

#### Step 8: 访问网站

找到你的域名（在 Pages 项目首页）：
```
https://couple-commitment-tracker.pages.dev
```

登录密码：`123456`

**⚠️ 首次登录后立即修改密码！**

## 完成！🎉

现在你的网站已经上线了！

后续每次 `git push` 都会自动部署新版本。

## 常用命令

```bash
# 本地开发
npm run dev

# 构建
npm run build

# 本地预览
npm run preview

# 查看部署状态
wrangler pages project list

# 重新部署
wrangler pages deploy frontend/dist
```

## 需要帮助？

查看完整文档：[README.md](./README.md)
