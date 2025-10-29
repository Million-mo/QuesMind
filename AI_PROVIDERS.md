# AI 提供商配置指南

QuesMind 支持多个 AI 提供商,您可以根据需求选择使用 OpenAI 或 DeepSeek。

## 支持的提供商

### 1. OpenAI
- **模型**: gpt-4o-mini (默认), gpt-3.5-turbo (备用)
- **优势**: 性能稳定,质量高
- **官网**: https://platform.openai.com/

### 2. DeepSeek
- **模型**: deepseek-chat
- **优势**: 性价比高,支持中文
- **官网**: https://platform.deepseek.com/

## 配置步骤

### 1. 获取 API Key

#### OpenAI
1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 在 API keys 页面创建新的 API key
4. 复制保存 API key

#### DeepSeek
1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 在 API keys 页面创建新的 API key
4. 复制保存 API key

### 2. 配置环境变量

编辑项目根目录的 `.env.local` 文件:

```bash
# 选择 AI 提供商: openai 或 deepseek
AI_PROVIDER=deepseek

# OpenAI 配置
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# DeepSeek 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

**重要**: 
- `AI_PROVIDER` 可以设置为 `openai` 或 `deepseek`
- 只需要配置您选择使用的提供商的 API key
- 如果不设置 `AI_PROVIDER`,默认使用 `openai`

### 3. 重启开发服务器

修改环境变量后,需要重启服务器使配置生效:

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 使用建议

### OpenAI
- 适合对质量要求高的场景
- 英文内容处理效果更好
- 成本相对较高

### DeepSeek
- 性价比高,适合大量使用
- 中文内容处理效果优秀
- API 调用速度快

## 费用对比

### OpenAI (gpt-4o-mini)
- 输入: ~$0.15 / 1M tokens
- 输出: ~$0.60 / 1M tokens

### DeepSeek (deepseek-chat)
- 输入: ~$0.14 / 1M tokens (缓存命中 $0.014)
- 输出: ~$0.28 / 1M tokens

*注意: 具体价格请以官网最新公告为准*

## 切换提供商

要切换 AI 提供商,只需:

1. 修改 `.env.local` 中的 `AI_PROVIDER` 值
2. 确保对应的 API key 已配置
3. 重启开发服务器

```bash
# 使用 OpenAI
AI_PROVIDER=openai

# 使用 DeepSeek
AI_PROVIDER=deepseek
```

## 常见问题

### Q: 可以同时使用两个提供商吗?
A: 当前版本只能选择一个提供商。如果需要切换,修改 `AI_PROVIDER` 环境变量即可。

### Q: API key 安全吗?
A: API key 保存在 `.env.local` 文件中,该文件不会被提交到 git 仓库。请勿将 API key 分享给他人。

### Q: 如何监控 API 使用量?
A: 可以在各提供商的官方控制台查看 API 使用情况和费用。

### Q: DeepSeek 支持哪些功能?
A: DeepSeek 完全兼容 OpenAI API 格式,支持所有功能:
- 问答生成
- 答案评估
- JSON 格式输出

## 技术细节

项目使用统一的 OpenAI SDK,通过配置不同的 `baseURL` 来支持 DeepSeek:

```typescript
// OpenAI
const client = new OpenAI({
  apiKey: openaiApiKey,
});

// DeepSeek
const client = new OpenAI({
  apiKey: deepseekApiKey,
  baseURL: 'https://api.deepseek.com',
});
```

这种方式确保了代码的兼容性和可维护性。
