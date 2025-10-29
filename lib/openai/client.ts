import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('缺少 OPENAI_API_KEY 环境变量');
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

// 默认模型配置
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const FALLBACK_MODEL = 'gpt-3.5-turbo';

// Token 限制
export const MAX_TOKENS = {
  'gpt-4o-mini': 4096,
  'gpt-4-turbo': 8192,
  'gpt-3.5-turbo': 4096,
};
