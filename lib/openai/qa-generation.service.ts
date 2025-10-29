import { openai, DEFAULT_MODEL } from './client';
import type { QAGenerationPrompt, GeneratedQAPair } from '@/types';

/**
 * 问答生成服务
 * 负责调用 OpenAI API 从文章内容生成问答对
 */
export class QAGenerationService {
  /**
   * 根据文章内容生成问答对
   */
  static async generateQAPairs(
    prompt: QAGenerationPrompt
  ): Promise<GeneratedQAPair[]> {
    const { articleContent, questionCount, difficulty = 'medium' } = prompt;

    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(difficulty);
    
    // 构建用户提示词
    const userPrompt = this.buildUserPrompt(articleContent, questionCount);

    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      // 解析 JSON 响应
      const result = JSON.parse(content);
      
      // 验证并转换结果
      return this.validateAndTransformQAPairs(result.qaPairs || []);
    } catch (error) {
      console.error('问答生成失败:', error);
      throw new Error('问答生成失败,请稍后重试');
    }
  }

  /**
   * 构建系统提示词
   */
  private static buildSystemPrompt(difficulty: string): string {
    return `你是一位专业的教育内容设计师,擅长从文章中提取关键知识点并生成高质量的问答对。

你的任务:
1. 仔细阅读提供的文章内容
2. 识别文章中的核心概念、关键事实和重要观点
3. 生成具有教育价值的问答对

问答对要求:
- 问题要具体、明确,避免模糊不清
- 答案要准确、完整,涵盖关键要点
- 难度等级: ${difficulty === 'easy' ? '简单(基础概念和事实)' : difficulty === 'hard' ? '困难(深入分析和综合)' : '中等(理解和应用)'}
- 问题类型要多样化(事实、概念、应用、分析等)

输出格式:
严格遵循 JSON 格式:
{
  "qaPairs": [
    {
      "question": "问题内容",
      "answer": "详细答案",
      "difficulty": 1-5 (1最简单,5最难)
    }
  ]
}`;
  }

  /**
   * 构建用户提示词
   */
  private static buildUserPrompt(content: string, count: number): string {
    // 如果内容过长,进行截断
    const maxContentLength = 8000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...(内容已截断)'
      : content;

    return `请从以下文章中生成 ${count} 个问答对:

文章内容:
${truncatedContent}

请生成 ${count} 个高质量的问答对,确保覆盖文章的主要知识点。`;
  }

  /**
   * 验证并转换问答对
   */
  private static validateAndTransformQAPairs(
    pairs: unknown[]
  ): GeneratedQAPair[] {
    const validPairs: GeneratedQAPair[] = [];

    for (const pair of pairs) {
      if (this.isValidQAPair(pair)) {
        validPairs.push({
          question: pair.question.trim(),
          answer: pair.answer.trim(),
          difficulty: pair.difficulty || 3,
        });
      }
    }

    if (validPairs.length === 0) {
      throw new Error('未生成有效的问答对');
    }

    return validPairs;
  }

  /**
   * 验证单个问答对的有效性
   */
  private static isValidQAPair(pair: any): pair is GeneratedQAPair {
    return (
      typeof pair === 'object' &&
      typeof pair.question === 'string' &&
      typeof pair.answer === 'string' &&
      pair.question.length > 0 &&
      pair.answer.length > 0 &&
      pair.question.length <= 1000 &&
      pair.answer.length <= 5000
    );
  }

  /**
   * 根据文章长度计算建议的问答对数量
   */
  static calculateRecommendedCount(wordCount: number): number {
    if (wordCount < 500) return 3;
    if (wordCount < 2000) return 5;
    if (wordCount < 5000) return 10;
    return 15;
  }
}
