# Couple Commitment Tracker 💕

情侣约定记录系统 - 共同记录见面后要做的事情

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/btn.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/Hjjjkh/qingldaib)

## 🚀 快速部署

点击上面的 **Deploy to Cloudflare Pages** 按钮，或按照以下步骤手动部署。

### 自动部署（推荐）

1. **点击 Deploy Button**
2. **授权 Cloudflare 访问 GitHub**
3. **选择仓库** `Hjjjkh/qingldaib`
4. **配置构建设置**：

```
Framework preset:        Vite
Build command:           npm run build
Build output directory:  frontend/dist
Root directory:          /
Node version:           18
```

5. **点击 Save and Deploy**

### 创建 Cloudflare 资源

打开终端执行：

```bash
# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create couple-commitment-db

# 创建 KV 命名空间
wrangler kv:namespace create couple-session

# 创建 R2 存储桶
wrangler r2 bucket create couple-photos
```

### 配置绑定

在 Pages 项目页面：

1. **Settings** → **Functions** → **Function bindings**
2. **Add binding** 添加 3 个绑定：

| Binding 类型 | Variable name | 选择资源 |
|-------------|---------------|----------|
| **D1 Database** | `DB` | `couple-commitment-db` |
| **KV Namespace** | `SESSION_STORE` | `couple-session` |
| **R2 Bucket** | `PHOTOS` | `couple-photos` |

### 添加环境变量

**Settings** → **Environment variables**：

```
Variable name: JWT_SECRET
Value: 运行 openssl rand -hex 32 生成的随机字符串
```

### 初始化数据库

```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

### 完成！🎉

访问你的 Pages 域名：
```
https://qingldaib.pages.dev
```

默认登录密码：`123456`

**⚠️ 首次登录后请立即修改密码！**

---

## 功能

- ✅ 约定清单管理（添加/编辑/删除/筛选）
- ✅ 打卡功能（标记完成/取消/历史记录）
- ✅ 照片上传（R2 存储）
- ✅ 见面记录管理
- ✅ 进度统计（完成率/分类统计/趋势图表）
- ✅ 简单密码认证

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 + TypeScript + Vite |
| **UI** | Naive UI |
| **状态管理** | Pinia |
| **路由** | Vue Router |
| **后端** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 (SQLite) |
| **存储** | Cloudflare R2 |
| **缓存** | Cloudflare KV |
| **认证** | JWT + bcryptjs |

## 自动部署

配置完成后，每次推送代码到 `main` 分支：

```bash
git add .
git commit -m "feat: 新功能描述"
git push origin main
```

Cloudflare Pages 会自动：
1. 检测代码变更
2. 执行 `npm run build`
3. 部署到全球 CDN
4. 更新 Functions

## 项目结构

```
├── functions/              # Cloudflare Pages Functions (后端)
│   ├── api/
│   │   ├── auth/          # 认证 API
│   │   ├── commitments/   # 约定管理 API
│   │   ├── meetings/      # 见面记录 API
│   │   ├── photos/        # 照片上传 API
│   │   └── statistics/    # 统计数据 API
│   ├── _middleware.ts     # JWT 中间件
│   └── schema.sql         # 数据库 Schema
│
├── frontend/               # Vue 3 前端
│   └── src/
│       ├── layouts/       # 布局组件
│       ├── pages/         # 页面组件
│       ├── stores/        # Pinia stores
│       └── router/        # 路由配置
│
└── package.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 本地预览
npm run preview
```

## 费用

Cloudflare 免费额度完全够用：

- ✅ Pages: 无限次构建
- ✅ Functions: 每日 10 万次请求
- ✅ D1: 500 万次读取/月
- ✅ R2: 10GB 存储 + 10GB 读取/月
- ✅ KV: 10 万次读取/天

## 常见问题

### Q: 登录失败 (401)？

**A:** 检查 D1 数据库是否已初始化：
```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

### Q: 照片上传失败？

**A:** 检查 R2 存储桶是否正确绑定

### Q: 如何重新部署？

**A:** 推送代码自动部署，或手动执行：
```bash
wrangler pages deploy frontend/dist
```

## 支持

- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 📖 [详细部署指南](./DEPLOY.md)
- 📖 [项目总结](./PROJECT_SUMMARY.md)

## 开发日志

- 2026-05-01: 项目创建并部署

## License

MIT
