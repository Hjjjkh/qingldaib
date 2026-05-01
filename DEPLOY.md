# 快速部署指南

## 🚀 5 分钟上线你的情侣约定网站

### 方式一：使用 Deploy Button（推荐，自动配置资源）

1. 点击 README 顶部的 **[Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/?url=https://github.com/Hjjjkh/qingldaib)** 按钮
2. 授权 Cloudflare 访问 GitHub
3. **Project name**: 输入项目名称（如 `couple-commitment`）
4. 等待自动配置资源页面出现
5. 确认以下配置自动填充：
   - **KV namespace**: `couple-commitment-tracker`
   - **D1 database**: `couple-commitment-db`
   - **R2 bucket**: `couple-photos`
   - **JWT_SECRET**: 自动生成或自定义
6. **Build command**: `npm run build`
7. **Deploy command**: **留空**（不要填写！）
8. 点击 **Save and Deploy**

部署成功后访问你的域名即可！

---

### 方式二：手动配置（如 Deploy Button 不可用）

#### Step 1: 创建 Pages 项目

1. 访问：https://dash.cloudflare.com/?to=/:account/pages
2. **Create application** → **Pages** → **Connect to Git**
3. 选择仓库 `qingldaib` 或 `couple-commitment`
4. 配置构建：
   - **Build command**: `npm run build`
   - **Build output directory**: `frontend/dist`
   - **Deploy command**: **留空** ❌
5. **Save and Deploy**

#### Step 2: 配置资源绑定

部署成功后：

1. **Settings** → **Bindings** → **Add binding**
2. 添加 3 个绑定：

| Type | Variable name | Resource |
|------|---------------|----------|
| D1 database | `DB` | `couple-commitment-db` (新建) |
| KV namespace | `SESSION_STORE` | `couple-commitment-tracker` (新建) |
| R2 bucket | `PHOTOS` | `couple-photos` (新建) |

3. **Save and Deploy** 重新部署

#### Step 3: 添加环境变量

1. **Settings** → **Environment variables** → **Add variable**
2. 添加：
   - **Variable name**: `JWT_SECRET`
   - **Value**: 任意随机字符串（如 `my-secret-123456`）
3. **Save and Deploy**

#### Step 4: 初始化数据库

在本地终端执行：
```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 初始化数据库
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

输入 `y` 确认。

---

## ✅ 访问网站

找到你的域名（在 Pages 项目首页）：
```
https://couple-commitment.pages.dev
```

登录密码：`123456`

**⚠️ 首次登录后立即修改密码！**

---

## 🔄 自动部署

配置完成后，每次 `git push` 都会自动部署新版本，无需任何操作！

```bash
git add .
git commit -m "修复登录问题"
git push origin main
```

---

## 常用命令

```bash
# 本地开发
npm run dev

# 构建
npm run build

# 本地预览（测试构建产物）
npm run preview

# 手动部署（可选，仅当自动部署失败时）
npm run deploy
```

## 遇到问题？

- 📖 [完整 README](./README.md)
- 💬 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
