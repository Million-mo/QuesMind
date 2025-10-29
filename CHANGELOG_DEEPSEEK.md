# DeepSeek 集成更新日志

## 更新时间
2025-10-29

## 更新内容

### 1. 核心功能改进

#### 1.1 多 AI 提供商支持
- ✅ 支持 OpenAI (GPT-4o-mini)
- ✅ 支持 DeepSeek (deepseek-chat)
- ✅ 通过环境变量灵活切换
- ✅ 保持代码兼容性,无需修改业务逻辑

#### 1.2 URL 导入功能
- ✅ 支持从网页 URL 直接导入文章内容
- ✅ 智能提取文章标题和正文
- ✅ 自动过滤广告、导航等无关内容
- ✅ 30秒超时保护机制

### 2. 修改的文件

#### 配置文件
- `lib/openai/client.ts` - AI 客户端重构,支持多提供商
- `.env.local` - 添加 AI_PROVIDER 和 DEEPSEEK_API_KEY 配置
- `.env.example` - 更新示例配置

#### 服务层
- `lib/openai/qa-generation.service.ts` - 使用统一的 AI 客户端
- `lib/openai/answer-evaluation.service.ts` - 使用统一的 AI 客户端
- `lib/services/url-fetch.service.ts` - 新增 URL 内容抓取服务

#### API 路由
- `app/api/files/fetch-url/route.ts` - 新增 URL 抓取 API 端点

#### 前端页面
- `app/(dashboard)/articles/new/page.tsx` - 添加 URL 导入选项和 UI

#### 文档
- `AI_PROVIDERS.md` - AI 提供商完整配置指南
- `DEEPSEEK_QUICKSTART.md` - DeepSeek 快速配置指南
- `README.md` - 更新项目说明

### 3. 新增依赖

```json
{
  "cheerio": "^1.0.0",
  "@types/cheerio": "^0.22.35"
}
```

### 4. 环境变量配置

#### 新增环境变量
```bash
# AI 提供商选择
AI_PROVIDER=openai|deepseek

# DeepSeek API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxx
```

#### 完整配置示例
```bash
# AI 配置
AI_PROVIDER=deepseek          # 或 openai
OPENAI_API_KEY=sk-xxx         # OpenAI Key
DEEPSEEK_API_KEY=sk-xxx       # DeepSeek Key
```

### 5. 使用方法

#### 切换到 DeepSeek
```bash
# 1. 编辑 .env.local
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_actual_key

# 2. 重启服务器
npm run dev
```

#### 切换到 OpenAI
```bash
# 1. 编辑 .env.local
AI_PROVIDER=openai
OPENAI_API_KEY=your_actual_key

# 2. 重启服务器
npm run dev
```

### 6. 技术实现细节

#### 6.1 统一客户端接口
```typescript
// 根据环境变量动态初始化客户端
const aiClient = new OpenAI({
  apiKey: provider === 'deepseek' ? deepseekKey : openaiKey,
  baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : undefined,
});
```

#### 6.2 URL 内容提取
```typescript
// 使用 cheerio 解析 HTML
const $ = cheerio.load(html);

// 智能选择文章容器
const selectors = ['article', '[role="main"]', 'main', ...];

// 清理和格式化内容
const content = cleanContent(extractedText);
```

### 7. 兼容性说明

- ✅ DeepSeek 完全兼容 OpenAI API 格式
- ✅ 支持 JSON 模式输出
- ✅ 支持 temperature、max_tokens 等参数
- ✅ 所有现有功能无需修改即可使用

### 8. 性能和成本

#### OpenAI (gpt-4o-mini)
- 输入: ~$0.15 / 1M tokens
- 输出: ~$0.60 / 1M tokens

#### DeepSeek (deepseek-chat)
- 输入: ~$0.14 / 1M tokens (缓存 $0.014)
- 输出: ~$0.28 / 1M tokens

**结论**: DeepSeek 成本约为 OpenAI 的 50%

### 9. 测试建议

1. **切换测试**: 分别测试两个提供商的问答生成和评估功能
2. **URL 导入测试**: 测试不同类型网页的内容提取
3. **错误处理**: 测试无效 API Key、网络错误等场景
4. **性能测试**: 对比两个提供商的响应时间

### 10. 后续优化建议

- [ ] 添加提供商切换 UI (让用户可以在界面选择)
- [ ] 添加使用量统计和成本跟踪
- [ ] 支持更多 AI 提供商(如 Claude、文心一言)
- [ ] 添加 AI 响应缓存机制
- [ ] 提供批量处理 API

### 11. 迁移指南

如果您已有项目在运行:

1. 拉取最新代码
2. 安装新依赖: `npm install`
3. 更新 `.env.local` 添加 `AI_PROVIDER` 和 `DEEPSEEK_API_KEY`
4. 重启开发服务器

**向后兼容**: 如果不配置 `AI_PROVIDER`,默认使用 OpenAI。

### 12. 常见问题解决

#### 问题 1: DeepSeek API 调用失败
```
解决: 检查 API Key 是否正确,确保账户有余额
```

#### 问题 2: URL 导入失败
```
解决: 检查 URL 是否可访问,某些网站可能有防爬限制
```

#### 问题 3: 切换提供商后报错
```
解决: 确保重启了开发服务器,环境变量需要重新加载
```

---

## 总结

本次更新实现了:
1. ✅ 支持 DeepSeek AI 提供商
2. ✅ 支持 URL 导入文章功能
3. ✅ 提供灵活的配置选项
4. ✅ 保持代码整洁和可维护性
5. ✅ 提供详细的文档和指南

用户现在可以根据需求选择更经济实惠的 DeepSeek 或功能强大的 OpenAI,同时享受更便捷的文章导入体验!
