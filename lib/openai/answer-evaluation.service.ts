import { aiClient, DEFAULT_MODEL, CURRENT_PROVIDER } from './client';
import type { AnswerEvaluationPrompt, EvaluationResult } from '@/types';

/**
 * 答案评估服务
 * 负责使用 AI 评估用户答案的质量
 */
export class AnswerEvaluationService {
  /**
   * 评估用户答案
   */
  static async evaluateAnswer(
    prompt: AnswerEvaluationPrompt
  ): Promise<EvaluationResult> {
    const { question, standardAnswer, userAnswer } = prompt;

    // 构建评估提示词
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(question, standardAnswer, userAnswer);

    try {
      const response = await aiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // 较低的温度以获得更一致的评分
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 评估返回内容为空');
      }

      // 解析 JSON 响应
      const result = JSON.parse(content);
      
      // 验证并返回结果
      return this.validateAndTransformResult(result);
    } catch (error) {
      console.error(`答案评估失败 (${CURRENT_PROVIDER}):`, error);
      throw new Error('答案评估失败,请稍后重试');
    }
  }

  /**
   * 构建系统提示词
   */
  private static buildSystemPrompt(): string {
    return `你是一位专业的教育评估专家,负责评估学生答案的质量。

评估维度:
1. 准确性 (50%): 核心概念和关键事实是否正确
2. 完整性 (30%): 是否覆盖了主要要点
3. 表达清晰度 (20%): 逻辑是否连贯,表达是否清楚

评分标准:
- 90-100分: 优秀,答案准确完整,表达清晰
- 80-89分: 良好,核心内容正确,有小的遗漏或表达瑕疵
- 60-79分: 中等,基本理解正确,但有重要遗漏或部分错误
- 40-59分: 需改进,理解有偏差,遗漏较多
- 0-39分: 未掌握,理解错误或答非所问

输出格式:
严格遵循 JSON 格式:
{
  "score": 85,
  "feedback": "总体评价",
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"],
  "keyPointsCovered": true
}`;
  }

  /**
   * 构建用户提示词
   */
  private static buildUserPrompt(
    question: string,
    standardAnswer: string,
    userAnswer: string
  ): string {
    return `请评估以下学生答案:

问题:
${question}

标准答案:
${standardAnswer}

学生答案:
${userAnswer}

请根据评分标准给出详细的评估结果。`;
  }

  /**
   * 验证并转换评估结果
   */
  private static validateAndTransformResult(result: any): EvaluationResult {
    // 验证分数
    const score = typeof result.score === 'number' 
      ? Math.max(0, Math.min(100, result.score))
      : 0;

    // 验证反馈
    const feedback = typeof result.feedback === 'string' 
      ? result.feedback 
      : this.getDefaultFeedback(score);

    // 验证优点和改进建议
    const strengths = Array.isArray(result.strengths) 
      ? result.strengths.filter((s: any) => typeof s === 'string')
      : [];

    const improvements = Array.isArray(result.improvements)
      ? result.improvements.filter((i: any) => typeof i === 'string')
      : [];

    // 验证关键点覆盖情况
    const keyPointsCovered = typeof result.keyPointsCovered === 'boolean'
      ? result.keyPointsCovered
      : score >= 80;

    return {
      score,
      feedback,
      strengths,
      improvements,
      keyPointsCovered,
    };
  }

  /**
   * 根据分数获取默认反馈
   */
  private static getDefaultFeedback(score: number): string {
    if (score >= 90) {
      return '回答非常优秀,充分掌握了该知识点!';
    } else if (score >= 80) {
      return '回答良好,核心内容掌握准确,有小的提升空间。';
    } else if (score >= 60) {
      return '基本理解正确,但还有一些重要内容需要补充。';
    } else if (score >= 40) {
      return '对知识点的理解还不够准确,建议重新学习相关内容。';
    } else {
      return '回答与标准答案差距较大,建议认真复习原文。';
    }
  }

  /**
   * 生成个性化学习建议
   */
  static generateLearningTips(evaluationResult: EvaluationResult): string[] {
    const tips: string[] = [];
    const { score, keyPointsCovered } = evaluationResult;

    if (score < 60) {
      tips.push('建议重新阅读原文,标记关键概念');
      tips.push('尝试用自己的话总结文章要点');
    } else if (score < 80) {
      tips.push('核心概念已掌握,注意补充细节内容');
      if (!keyPointsCovered) {
        tips.push('回答时确保覆盖所有关键要点');
      }
    } else {
      tips.push('继续保持,可以尝试更深入的思考');
    }

    return tips;
  }
}
