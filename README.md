# QuesMind - AI 主动学习系统

基于 AI 的主动学习平台,通过"输入内容 → 生成问答 → 自我测试 → AI 评估 → 记忆巩固"的闭环流程,帮助用户高效掌握知识。

## 🚀 项目特性

- ✅ **智能问答生成**: 利用 AI 自动从文章中提取关键知识点并生成问答对
- ✅ **AI 实时评估**: 智能评估用户答案并提供个性化改进建议
- ✅ **多格式支持**: 支持文本粘贴、TXT、PDF、DOCX 文件上传
- ✅ **URL 导入**: 支持从网页链接直接导入文章内容
- ✅ **多 AI 提供商**: 支持 OpenAI 和 DeepSeek,可灵活切换
- ✅ **进度追踪**: 可视化学习进度和统计数据
- ✅ **间隔重复**: 基于遗忘曲线的智能复习提醒

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 + React 18 + TypeScript
- **UI 组件**: Tailwind CSS + shadcn/ui
- **状态管理**: React Context + Hooks
- **图标**: Lucide React

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **文件存储**: Supabase Storage

### AI 服务
- **模型**: OpenAI GPT-4o-mini / DeepSeek Chat (可配置)
- **文件解析**: pdf-parse, mammoth
- **网页抓取**: cheerio

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd QuesMind
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写以下配置:

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI 配置
# 选择 AI 提供商: openai 或 deepseek
AI_PROVIDER=openai

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key

# DeepSeek 配置 (可选)
DEEPSEEK_API_KEY=your_deepseek_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 配置 AI 提供商

**使用 OpenAI:**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 创建 API Key
3. 设置 `AI_PROVIDER=openai` 和 `OPENAI_API_KEY`

**使用 DeepSeek (推荐,性价比高):**
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 创建 API Key
3. 设置 `AI_PROVIDER=deepseek` 和 `DEEPSEEK_API_KEY`

详细配置指南: [AI_PROVIDERS.md](./AI_PROVIDERS.md) | [DeepSeek 快速开始](./DEEPSEEK_QUICKSTART.md)

### 4. 初始化数据库

在 Supabase 控制台中执行以下 SQL 脚本:

1. 执行 `database/schema.sql` 创建数据表
2. 执行 `database/rls_policies.sql` 配置行级安全策略

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📂 项目结构

```
QuesMind/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard 路由组
│   │   ├── dashboard/       # 概览页面
│   │   ├── articles/        # 文章管理
│   │   ├── cards/           # 问答卡片
│   │   └── progress/        # 学习统计
│   ├── auth/                # 认证页面
│   ├── api/                 # API 路由
│   ├── layout.tsx           # 根布局
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   └── ui/                  # UI 基础组件
├── contexts/                # React Context
│   └── AuthContext.tsx      # 认证上下文
├── lib/                     # 工具库
│   ├── supabase/           # Supabase 客户端
│   ├── openai/             # OpenAI 服务
│   ├── services/           # 业务服务
│   └── utils.ts            # 工具函数
├── types/                   # TypeScript 类型定义
├── database/                # 数据库脚本
│   ├── schema.sql          # 表结构
│   └── rls_policies.sql    # RLS 策略
└── public/                  # 静态资源
```

## 🎯 核心功能

### 1. 文章管理
- 创建文章(粘贴文本或上传文件)
- 自动提取文本内容
- 文章列表查看和管理

### 2. 问答生成
- AI 自动从文章生成问答对
- 根据文章长度智能调整问答数量
- 多样化问题类型(事实、概念、应用)

### 3. 智能答题
- 卡片式问答界面
- 实时 AI 评分(0-100分)
- 个性化反馈和改进建议

### 4. 学习追踪
- 整体学习进度统计
- 卡片状态管理(未答题/复习中/已掌握)
- 学习曲线可视化

## 🔐 数据库设计

### 核心数据表

- `user_profiles`: 用户配置表
- `articles`: 文章表
- `qa_pairs`: 问答对表
- `answer_attempts`: 答题记录表
- `card_status`: 卡片状态表

详细设计请参考 `database/schema.sql`

## 🚧 开发路线图

### MVP 阶段 (已完成)
- [x] 项目初始化和基础配置
- [x] 数据库设计和 RLS 策略
- [x] 用户认证系统
- [x] 文章上传和管理
- [x] AI 问答生成服务
- [x] 问答卡片 UI
- [x] AI 答案评估
- [x] Dashboard 页面

### 待开发功能
- [ ] 文件上传 API 实现
- [ ] 文章详情页面
- [ ] 卡片复习页面
- [ ] 学习统计图表
- [ ] 间隔重复算法
- [ ] 移动端优化
- [ ] 多人协作功能
- [ ] 知识图谱

## 📝 API 文档

### 文章管理

#### POST /api/articles
创建新文章并生成问答对

**请求体**:
```json
{
  "title": "文章标题",
  "content": "文章内容"
}
```

**响应**:
```json
{
  "articleId": "uuid",
  "qaCount": 10,
  "message": "文章创建成功"
}
```

#### GET /api/articles
获取文章列表

**查询参数**:
- `page`: 页码(默认 1)
- `limit`: 每页数量(默认 10)

## 🤝 贡献指南

欢迎贡献代码! 请遵循以下步骤:

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 👥 联系方式

如有问题或建议,请提交 Issue。

---

**QuesMind** - 让学习更高效! 🎓
