# DeepSeek 快速配置指南

## 快速开始(3步配置DeepSeek)

### 步骤 1: 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 **API Keys** 页面
4. 点击 **创建新的 API Key**
5. 复制生成的 API key (格式: `sk-xxxxxxxxxx`)

### 步骤 2: 配置环境变量

编辑项目根目录的 `.env.local` 文件:

```bash
# 将 AI_PROVIDER 改为 deepseek
AI_PROVIDER=deepseek

# 粘贴您的 DeepSeek API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤 3: 重启服务器

```bash
# 终端中按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

完成! 🎉 现在您的应用已切换到 DeepSeek AI。

---

## 切换回 OpenAI

如果需要切换回 OpenAI:

```bash
# .env.local
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

然后重启服务器。

---

## 验证配置

启动服务器后,检查终端输出:
- 如果看到 `✓ Ready` 说明配置成功
- 如果看到错误提示缺少 API key,请检查环境变量配置

测试功能:
1. 上传一篇文章
2. 查看是否能成功生成问答
3. 回答问题并查看评估结果

---

## DeepSeek 优势

✅ **性价比高** - 成本仅为 OpenAI 的 1/2 左右  
✅ **中文优化** - 对中文内容理解更好  
✅ **速度快** - API 响应时间短  
✅ **兼容性好** - 完全兼容 OpenAI API 格式  

---

## 费用说明

DeepSeek 按 token 计费:
- 输入: ¥0.001 / 千 tokens
- 输出: ¥0.002 / 千 tokens

示例: 处理一篇 3000 字的文章,生成 10 个问答对:
- 预计费用: ¥0.02 - ¥0.05 (约 2-5 分钱)

---

## 常见问题

**Q: 切换后需要修改代码吗?**  
A: 不需要,代码已经自动适配,只需修改环境变量。

**Q: 可以同时配置两个提供商吗?**  
A: 可以同时配置 API key,但只能使用 AI_PROVIDER 指定的一个。

**Q: DeepSeek 和 OpenAI 效果差异大吗?**  
A: 对于问答生成等任务,效果相近。中文内容可能 DeepSeek 更好。

---

## 需要帮助?

查看完整文档: [AI_PROVIDERS.md](./AI_PROVIDERS.md)
