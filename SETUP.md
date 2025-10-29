# QuesMind 快速设置指南

## 📋 前置要求

在开始之前,请确保您已经:

1. ✅ 安装了 Node.js (v18 或更高版本)
2. ✅ 拥有 Supabase 账号 (https://supabase.com)
3. ✅ 拥有 OpenAI API Key (https://platform.openai.com)
4. ✅ 安装了 Git

## 🚀 5 分钟快速部署

### 步骤 1: 克隆项目

```bash
git clone <your-repo-url>
cd QuesMind
npm install
```

### 步骤 2: 创建 Supabase 项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息并创建
4. 等待项目初始化完成

### 步骤 3: 设置数据库

1. 在 Supabase Dashboard 中,进入 "SQL Editor"
2. 依次执行以下 SQL 文件:
   - 复制 `database/schema.sql` 的内容并执行
   - 复制 `database/rls_policies.sql` 的内容并执行
3. 确认所有表创建成功

### 步骤 4: 获取 Supabase 配置

在 Supabase Dashboard 的 "Settings" → "API" 中获取:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY`: `service_role` `secret` key (⚠️ 保密)

### 步骤 5: 获取 OpenAI API Key

1. 访问 https://platform.openai.com/api-keys
2. 点击 "Create new secret key"
3. 复制并保存 API Key (⚠️ 仅显示一次)

### 步骤 6: 配置环境变量

在项目根目录创建 `.env.local` 文件:

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI 配置
OPENAI_API_KEY=sk-your_openai_key_here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 7: 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可开始使用!

## ✅ 验证安装

### 1. 检查数据库连接

- 访问 http://localhost:3000/auth/login
- 尝试注册一个新账号
- 检查 Supabase Dashboard 中的 `auth.users` 表是否有新记录

### 2. 测试文章创建

- 登录后访问 Dashboard
- 点击 "创建新文章"
- 粘贴一段文本(至少 200 字)
- 提交并等待问答生成

### 3. 验证 AI 功能

- 查看是否成功生成问答对
- 尝试回答一个问题
- 检查是否收到 AI 评分和反馈

## 🐛 常见问题

### 问题 1: "未授权访问" 错误

**原因**: Supabase 配置不正确

**解决方案**:
1. 检查 `.env.local` 中的 URL 和 Key 是否正确
2. 确认 Supabase 项目状态为 "Active"
3. 重启开发服务器 (`Ctrl+C` 然后 `npm run dev`)

### 问题 2: 问答生成失败

**原因**: OpenAI API Key 无效或余额不足

**解决方案**:
1. 访问 https://platform.openai.com/account/billing
2. 检查账户余额
3. 验证 API Key 是否有效
4. 确认 API Key 前缀为 `sk-`

### 问题 3: 文件上传失败

**原因**: 文件解析依赖未安装

**解决方案**:
```bash
npm install pdf-parse mammoth
```

### 问题 4: 数据库查询失败

**原因**: RLS 策略配置问题

**解决方案**:
1. 重新执行 `database/rls_policies.sql`
2. 在 Supabase Dashboard 的 "Table Editor" 中检查每个表的 RLS 是否启用
3. 确认策略规则正确

## 📊 性能优化建议

### 本地开发

```bash
# 使用更快的包管理器
npm install -g pnpm
pnpm install
pnpm dev
```

### 生产环境

1. **启用数据库索引**: 已在 schema.sql 中配置
2. **配置缓存**: 使用 Vercel 自动缓存
3. **优化图片**: 使用 Next.js Image 组件
4. **代码分割**: Next.js 自动处理

## 🚢 部署到 Vercel

### 方法 1: 通过 Vercel Dashboard

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置环境变量 (同 `.env.local`)
5. 点击 "Deploy"

### 方法 2: 通过 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

按照提示完成部署。

## 📝 下一步

- 📖 阅读完整文档: `README.md`
- 🎨 自定义主题颜色: 修改 `tailwind.config.ts`
- 🔧 调整 AI 参数: 查看 `lib/openai/*.service.ts`
- 📊 查看数据库设计: 阅读 `database/schema.sql`

## 💬 获取帮助

如遇到问题:

1. 查看 Issues: [项目 Issues 页面]
2. 阅读文档: 查看 README 和代码注释
3. 提交 Bug: 创建新的 Issue

---

祝您使用愉快! 🎉
