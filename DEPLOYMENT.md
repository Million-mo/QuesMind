# QuesMind 生产环境部署指南

## 📋 部署前检查清单

在部署到生产环境之前,请确保完成以下准备工作:

- [ ] ✅ 代码已推送到 GitHub
- [ ] ✅ Supabase 生产项目已创建
- [ ] ✅ OpenAI API Key 已准备(生产环境专用)
- [ ] ✅ 域名已准备(可选)
- [ ] ✅ 环境变量已记录

---

## 🚀 步骤 1: 创建 Supabase 生产项目

### 1.1 创建新项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息:
   - **Name**: quesmind-production
   - **Database Password**: 设置强密码并保存
   - **Region**: 选择离用户最近的区域
4. 等待项目初始化完成(约 2-3 分钟)

### 1.2 执行数据库脚本

1. 进入 SQL Editor
2. 依次执行以下脚本:
   ```sql
   -- 复制并执行 database/schema.sql
   -- 复制并执行 database/rls_policies.sql
   ```
3. 验证表创建成功:
   - 检查 Table Editor 中是否有 5 张表
   - 确认 RLS 策略已启用

### 1.3 获取生产环境密钥

在 Project Settings → API 中获取:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **重要**: `SERVICE_ROLE_KEY` 具有完全权限,请妥善保管!

---

## 🔑 步骤 2: 准备 OpenAI API Key

### 2.1 获取生产环境 API Key

1. 访问 https://platform.openai.com/api-keys
2. 创建新的 API Key (命名为 "QuesMind Production")
3. 设置使用限制(可选):
   - Monthly Budget: $10-50
   - Rate Limits: 根据预期用户量设置
4. 复制并保存 API Key

### 2.2 充值账户

确保账户有足够余额:
- 建议初始充值: $10-20
- 监控使用量,及时充值

---

## 🌐 步骤 3: 部署到 Vercel

### 方法 1: 通过 Vercel Dashboard (推荐)

#### 3.1 导入项目

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 选择 "QuesMind" 仓库

#### 3.2 配置环境变量

在 "Environment Variables" 部分添加:

| Key | Value | 说明 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxxx.supabase.co | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbG... | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbG... | Supabase 服务密钥 |
| `OPENAI_API_KEY` | sk-... | OpenAI API 密钥 |
| `NEXT_PUBLIC_APP_URL` | https://your-domain.vercel.app | 应用 URL |

⚠️ **注意**: 
- 所有变量都选择 "Production" 环境
- 不要将敏感密钥提交到 Git

#### 3.3 部署设置

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 3.4 开始部署

1. 点击 "Deploy"
2. 等待部署完成(约 2-5 分钟)
3. 访问生成的 URL 验证部署

### 方法 2: 通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY

# 5. 生产部署
vercel --prod
```

---

## 🔧 步骤 4: 配置 Supabase 认证

### 4.1 设置允许的重定向 URL

在 Supabase Dashboard → Authentication → URL Configuration:

**Site URL**: 
```
https://your-domain.vercel.app
```

**Redirect URLs**:
```
https://your-domain.vercel.app/**
http://localhost:3000/**
```

### 4.2 配置邮件模板(可选)

在 Authentication → Email Templates 自定义:
- Confirm signup
- Magic Link
- Reset password

---

## ✅ 步骤 5: 验证部署

### 5.1 功能测试

访问生产环境 URL,测试以下功能:

- [ ] ✅ 用户注册成功
- [ ] ✅ 用户登录成功
- [ ] ✅ 创建文章成功
- [ ] ✅ AI 生成问答成功
- [ ] ✅ 答题和评估成功
- [ ] ✅ 统计数据显示正常
- [ ] ✅ 所有页面加载正常

### 5.2 性能检查

使用 Google Lighthouse 检查:
- Performance > 80
- Accessibility > 90
- Best Practices > 90
- SEO > 90

### 5.3 监控设置

在 Vercel Dashboard 启用:
- ✅ Analytics
- ✅ Speed Insights
- ✅ Web Vitals

---

## 📊 步骤 6: 监控和维护

### 6.1 设置告警

**Supabase 告警**:
- Database CPU > 80%
- Storage > 80%
- API Requests > 1M/day

**Vercel 告警**:
- Build Failed
- Deployment Failed
- Error Rate > 1%

### 6.2 日志监控

- **Vercel Logs**: 查看应用日志
- **Supabase Logs**: 查看数据库查询日志
- **OpenAI Dashboard**: 监控 API 使用量和成本

### 6.3 备份策略

**Supabase 备份**:
- 启用自动备份(每日)
- 定期导出数据
- 保留最近 7 天备份

---

## 🔒 安全最佳实践

### 环境变量管理
- ✅ 使用环境变量存储敏感信息
- ✅ 不要在代码中硬编码密钥
- ✅ 定期轮换 API 密钥
- ✅ 限制 API Key 权限

### 数据库安全
- ✅ RLS 策略已启用
- ✅ 强密码策略
- ✅ 定期审计用户权限
- ✅ 启用 SSL/TLS

### API 安全
- ✅ 速率限制已配置
- ✅ CORS 策略正确
- ✅ 输入验证
- ✅ 错误信息不泄露敏感数据

---

## 💰 成本估算

### 预期成本(月)

| 服务 | 免费额度 | 预计成本 |
|------|---------|---------|
| Vercel | 100GB 带宽 | $0 (免费计划) |
| Supabase | 500MB 数据库 | $0 (免费计划) |
| OpenAI | - | $5-20 |
| **总计** | - | **$5-20/月** |

### 成本优化建议

1. **使用 GPT-4o-mini**: 比 GPT-4 便宜 90%
2. **缓存结果**: 减少重复 API 调用
3. **限制生成数量**: 每篇文章最多 15 个问答
4. **监控使用量**: 及时发现异常使用

---

## 🚨 故障排查

### 常见问题

#### 1. "未授权访问" 错误
- 检查环境变量是否正确配置
- 验证 Supabase URL 和 Key
- 确认 RLS 策略已启用

#### 2. AI 生成失败
- 检查 OpenAI API Key 是否有效
- 确认账户余额充足
- 查看 Vercel 函数日志

#### 3. 数据库连接失败
- 检查 Supabase 项目状态
- 验证数据库密码
- 确认防火墙设置

#### 4. 部署失败
- 检查构建日志
- 验证 package.json 依赖
- 确认 Node.js 版本兼容

---

## 📞 技术支持

### 获取帮助

- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs
- **OpenAI**: https://platform.openai.com/docs

### 社区资源

- Next.js 文档: https://nextjs.org/docs
- Supabase 社区: https://github.com/supabase/supabase/discussions
- Stack Overflow: 搜索相关问题

---

## 🎯 部署后优化

### 短期(1周内)

- [ ] 配置自定义域名
- [ ] 设置 SSL 证书
- [ ] 优化图片资源
- [ ] 添加 Analytics

### 中期(1个月内)

- [ ] 实现 CDN 加速
- [ ] 添加错误追踪(Sentry)
- [ ] 配置自动化测试
- [ ] 性能监控

### 长期(3个月内)

- [ ] 负载测试
- [ ] 扩展数据库
- [ ] 多区域部署
- [ ] 灾难恢复计划

---

**部署完成!** 🎉

您的 QuesMind 应用现已在生产环境运行!

记得定期检查:
- ✅ 应用性能
- ✅ 用户反馈
- ✅ 成本使用
- ✅ 安全更新
