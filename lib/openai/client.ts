import OpenAI from 'openai';

// AI 提供商类型
export type AIProvider = 'openai' | 'deepseek';

// 从环境变量获取配置
const aiProvider = (process.env.AI_PROVIDER || 'openai') as AIProvider;
const openaiApiKey = process.env.OPENAI_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

// 根据提供商初始化客户端
let client: OpenAI;
let defaultModel: string;

if (aiProvider === 'deepseek') {
  if (!deepseekApiKey) {
    throw new Error('缺少 DEEPSEEK_API_KEY 环境变量');
  }
  client = new OpenAI({
    apiKey: deepseekApiKey,
    baseURL: 'https://api.deepseek.com',
  });
  defaultModel = 'deepseek-chat';
} else {
  if (!openaiApiKey) {
    throw new Error('缺少 OPENAI_API_KEY 环境变量');
  }
  client = new OpenAI({
    apiKey: openaiApiKey,
  });
  defaultModel = 'gpt-4o-mini';
}

export const aiClient = client;
export const DEFAULT_MODEL = defaultModel;
export const CURRENT_PROVIDER = aiProvider;

// 模型配置
export const MODEL_CONFIGS = {
  openai: {
    default: 'gpt-4o-mini',
    fallback: 'gpt-3.5-turbo',
    maxTokens: 4096,
  },
  deepseek: {
    default: 'deepseek-chat',
    fallback: 'deepseek-chat',
    maxTokens: 4096,
  },
};

// 获取当前提供商的配置
export const getCurrentConfig = () => MODEL_CONFIGS[aiProvider];
