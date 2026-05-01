# Couple Commitment Tracker 💕

情侣约定记录系统 - 共同记录见面后要做的事情

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/btn.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/Hjjjkh/qingldaib)

## 🚀 5 分钟部署

### 步骤 1：点击 Deploy Button

1. **点击上方的 Deploy to Cloudflare Pages 按钮**
2. 授权 Cloudflare 访问 GitHub
3. **Project name**: 输入其他名称（如 `qingldaib-app`，不能用 `qingldaib` 因为已存在）
4. 配置构建：
   - **Build command**: `npm run build`
   - **Build output directory**: `frontend/dist`
   - **Deploy command**: **留空**（不要填！）
5. **Save and Deploy**

## ⚙️ 配置资源（重要！）

部署后需要配置数据库等资源，**全部可以在 Dashboard 完成，无需命令行**！

### 1. 进入设置

在 Pages 项目页面，点击 **Settings** → **Bindings**

### 2. 添加绑定

点击 **Add binding**，依次添加以下 3 个：

#### 添加 D1 数据库
```
Binding type: D1 database
Variable name: DB
Database: Create new... → 输入 "couple-commitment-db" → Create
```

#### 添加 KV 命名空间
```
Binding type: KV namespace
Variable name: SESSION_STORE
KV namespace: Create new... → 输入 "couple-session" → Create
```

#### 添加 R2 存储桶
```
Binding type: R2 bucket
Variable name: PHOTOS
Bucket: Create new... → 输入 "couple-photos" → Create
```

### 3. 设置环境变量

**Settings** → **Environment variables** → **Add variable**

```
Variable name: JWT_SECRET
Value: 随便输入随机字符串（如：my-secret-key-123456）
```

### 4. 重新部署

配置完成后，点击 **Save and Deploy** 重新部署。

---

## 📊 初始化数据库

打开项目中的 **Terminal**（或本地终端）：

```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

输入 `y` 确认。

> 💡 没有 wrangler？先执行 `npm install -g wrangler` 然后 `wrangler login`

---

## 🎉 完成！

访问你的域名：
```
https://qingldaib.pages.dev
```

登录密码：`123456`

**⚠️ 首次登录后请立即修改密码！**

---

## 功能

- ✅ 约定清单管理
- ✅ 打卡功能
- ✅ 照片上传
- ✅ 见面记录
- ✅ 进度统计
- ✅ 密码认证

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI**: Naive UI
- **后端**: Cloudflare Pages Functions
- **数据库**: D1 (SQLite)
- **存储**: R2
- **缓存**: KV

## 自动部署

每次推送代码到 `main` 分支会自动部署：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

## 费用

Cloudflare 免费额度完全够用：
- Pages: 无限次构建
- D1: 500 万次读取/月
- R2: 10GB 存储
- KV: 10 万次读取/天

## 支持

- 📖 [详细部署指南](./DEPLOY.md)
- 📖 [Cloudflare 文档](https://developers.cloudflare.com/pages/)

## License

MIT
