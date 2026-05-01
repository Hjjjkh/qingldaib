# Couple Commitment Tracker 💕

情侣约定记录系统 - 共同记录见面后要做的事情

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/btn.svg)](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github)

## 功能

- ✅ 约定清单管理（添加/编辑/删除/筛选）
- ✅ 打卡功能（标记完成/取消/历史记录）
- ✅ 照片上传（R2 存储）
- ✅ 见面记录管理
- ✅ 进度统计（完成率/分类统计/趋势图表）
- ✅ 简单密码认证

## 一键部署到 Cloudflare Pages

点击上面的 **Deploy to Cloudflare Pages** 按钮，或按照以下步骤手动部署：

### 快速开始（5 分钟上线）

#### 1. 推送代码到 GitHub

```bash
cd /workspace

# 初始化 git（如果还没有）
git init
git add .
git commit -m "Initial commit: couple commitment tracker"

# 创建 GitHub 仓库并推送
# 访问 https://github.com/new 创建新仓库
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2. 连接到 Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 **Workers & Pages** → **Create application**
3. 选择 **Pages** → **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub 账号
5. 选择你刚推送的仓库
6. 点击 **Begin setup**

#### 3. 配置构建设置

在 **Build settings** 页面：

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | `/` |
| **Node version** | `18` |

点击 **Save and Deploy**

#### 4. 创建 Cloudflare 资源

部署会失败（因为还没配置数据库等），现在创建必需的资源：

##### 创建 D1 数据库

```bash
# 登录 Cloudflare
wrangler login

# 创建数据库
wrangler d1 create couple-commitment-db

# 记录返回的 database_id（类似：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
```

##### 创建 KV 命名空间

```bash
wrangler kv:namespace create couple-session
# 记录返回的 namespace id
```

##### 创建 R2 存储桶

```bash
wrangler r2 bucket create couple-photos
```

#### 5. 配置绑定

1. 回到 Cloudflare Pages 项目页面
2. 点击 **Settings** → **Functions** → **Function bindings**
3. 点击 **Add binding**，添加以下 3 个绑定：

| Binding 类型 | Variable name | 选择资源 |
|-------------|---------------|----------|
| **D1 Database** | `DB` | `couple-commitment-db` |
| **KV Namespace** | `SESSION_STORE` | `couple-session` |
| **R2 Bucket** | `PHOTOS` | `couple-photos` |

4. 点击 **Save and Deploy**

#### 6. 配置环境变量

1. 在 Pages 项目页面，进入 **Settings** → **Environment variables**
2. 点击 **Add variable**
3. 添加：
   - **Variable name**: `JWT_SECRET`
   - **Value**: 运行 `openssl rand -hex 32` 生成的随机字符串
4. 点击 **Save**

#### 7. 初始化数据库

在本地终端执行：

```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

输入 `y` 确认执行。

#### 8. 完成！🎉

访问你的 Pages 域名：
```
https://couple-commitment-tracker.pages.dev
```

默认登录密码：`123456`

**⚠️ 首次登录后请立即修改密码！**

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

几分钟后访问网站即可看到更新！

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

## 项目结构

```
couple-commitment-tracker/
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
├── wrangler.toml          # Cloudflare 配置
└── package.json
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |
| GET | /api/commitments | 获取约定列表 |
| POST | /api/commitments | 创建约定 |
| PUT | /api/commitments/:id | 更新约定 |
| DELETE | /api/commitments/:id | 删除约定 |
| POST | /api/commitments/:id/checkin | 打卡 |
| DELETE | /api/commitments/:id/checkin | 取消打卡 |
| GET | /api/meetings | 获取见面记录 |
| POST | /api/meetings | 创建见面记录 |
| POST | /api/photos | 上传照片 |
| GET | /api/statistics/overview | 统计总览 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 本地预览（使用 wrangler）
npm run preview
```

## 费用

Cloudflare 免费额度完全够用：

- ✅ Pages: 无限次构建
- ✅ Functions: 每日 10 万次请求
- ✅ D1: 500 万次读取/月
- ✅ R2: 10GB 存储 + 10GB 读取/月
- ✅ KV: 10 万次读取/天

## 自定义域名

1. 在 Pages 项目页面进入 **Custom domains**
2. 点击 **Add custom domain**
3. 输入你的域名
4. 按提示配置 DNS CNAME 记录

## 常见问题

### Q: 登录失败 (401)？

检查：
1. D1 数据库是否已初始化（执行步骤 7）
2. `JWT_SECRET` 环境变量是否配置
3. 浏览器控制台错误信息

### Q: 照片上传失败？

检查：
1. R2 存储桶是否正确绑定
2. 文件大小不超过 5MB
3. 文件类型为图片格式

### Q: 如何重新初始化数据库？

```bash
wrangler d1 execute couple-commitment-db --file=functions/schema.sql
```

## 支持

- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 📖 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- 🐛 [项目 Issues](https://github.com/YOUR_USERNAME/REPO_NAME/issues)

## 开发日志

- 2026-05-01: 项目创建

## License

MIT
