# 情侣约定记录系统 - 部署任务清单

Feature Name: couple-commitment-tracker
Updated: 2026-05-01

## 部署方式：Cloudflare Pages + GitHub

### 阶段 1: 项目结构重组 (预计 0.5 天)

- [ ] 创建根目录 package.json（monorepo 结构）
- [ ] 配置 npm workspaces
- [ ] 移动 backend 到 functions 目录（Cloudflare Pages Functions）
- [ ] 保持 frontend 在根目录（或合并到 public）
- [ ] 配置构建命令和输出目录
- [ ] 更新 wrangler.toml 配置

### 阶段 2: Cloudflare Pages 配置 (预计 0.5 天)

- [ ] 创建 Cloudflare Pages 项目
- [ ] 连接 GitHub 仓库
- [ ] 配置构建设置：
  - 构建命令：`npm run build`
  - 输出目录：`frontend/dist`
  - Functions 目录：`functions/`
- [ ] 创建 D1 数据库绑定
- [ ] 创建 KV 命名空间绑定
- [ ] 创建 R2 存储桶绑定
- [ ] 配置环境变量（JWT_SECRET 等）

### 阶段 3: GitHub 仓库设置 (预计 0.25 天)

- [ ] 创建 GitHub 仓库
- [ ] 初始化 git 并推送代码
- [ ] 配置 Cloudflare Pages 自动部署
- [ ] 测试自动部署流程

### 阶段 4: 数据库初始化 (预计 0.25 天)

- [ ] 创建 D1 数据库
- [ ] 执行 schema.sql 初始化表结构
- [ ] 创建初始管理员账号

### 阶段 5: 测试与验证 (预计 0.5 天)

- [ ] 测试登录功能
- [ ] 测试约定 CRUD
- [ ] 测试打卡功能
- [ ] 测试照片上传
- [ ] 测试见面记录
- [ ] 测试统计数据
- [ ] 配置自定义域名（可选）

## 新的项目结构

```
couple-commitment-tracker/
├── functions/              # Cloudflare Pages Functions (后端 API)
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.ts
│   │   ├── commitments/
│   │   │   ├── [[id]].ts
│   │   │   └── [[id]]/
│   │   │       └── checkin.ts
│   │   ├── meetings/
│   │   │   └── [[id]].ts
│   │   ├── photos/
│   │   │   └── [[id]].ts
│   │   └── statistics/
│   │       ├── overview.ts
│   │       └── monthly.ts
│   └── _middleware.ts
│
├── frontend/               # Vue 3 前端项目
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── wrangler.toml           # Cloudflare 配置
├── package.json            # 根 package.json (workspaces)
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions (可选)
```

## Cloudflare Pages Functions 说明

### 目录路由规则
- `functions/api/auth/login.ts` → `/api/auth/login`
- `functions/api/commitments/[[id]].ts` → `/api/commitments/:id?`
- `functions/api/commitments/[[id]]/checkin.ts` → `/api/commitments/:id?/checkin`

### Middleware 配置
```typescript
// functions/_middleware.ts
export async function onRequest(context) {
  // 认证逻辑
}
```

## 构建配置

### Cloudflare Pages 设置
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `frontend/dist`
- **Root directory**: `/`
- **Environment variables**:
  - `JWT_SECRET`: 随机字符串
  - `NODE_VERSION`: `18`

### package.json scripts
```json
{
  "scripts": {
    "dev": "npm run dev --workspace=frontend",
    "build": "npm run build --workspace=frontend",
    "preview": "wrangler pages dev frontend/dist"
  }
}
```

## 环境变量配置

### Cloudflare Pages 环境变量
在 Cloudflare Dashboard 设置：
- `JWT_SECRET`：用于 JWT 签名的密钥
- `D1_DATABASE_ID`：D1 数据库 ID
- `KV_NAMESPACE_ID`：KV 命名空间 ID
- `R2_BUCKET_NAME`：R2 存储桶名称

### 绑定配置
在 Cloudflare Pages 设置 → Functions → 绑定：
- D1 数据库：`DB` → 选择 `couple-commitment-db`
- KV Namespace：`SESSION_STORE` → 选择 KV 命名空间
- R2 Bucket：`PHOTOS` → 选择 `couple-photos`

## 部署流程

### 首次部署
1. 创建 GitHub 仓库并推送代码
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 GitHub 仓库
4. 配置构建设置和环境变量
5. 创建 Cloudflare 资源（D1/KV/R2）
6. 执行数据库初始化
7. 触发首次部署

### 后续部署
- 推送代码到 main 分支 → 自动部署
- 创建 Pull Request → 自动生成预览链接

## 命令参考

### 本地开发
```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev

# 构建
npm run build

# 本地预览
npm run preview
```

### Cloudflare 资源管理
```bash
# 登录
wrangler login

# 创建 D1
wrangler d1 create couple-commitment-db

# 创建 KV
wrangler kv:namespace create couple-session

# 创建 R2
wrangler r2 bucket create couple-photos

# 执行 SQL
wrangler d1 execute couple-commitment-db --file=schema.sql
```
