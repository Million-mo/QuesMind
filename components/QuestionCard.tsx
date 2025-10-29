'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Eye, EyeOff, Loader2, Star } from 'lucide-react';
import type { QAPair } from '@/types';

interface QuestionCardProps {
  qaPair: QAPair;
  onAnswerSubmit?: (qaPairId: string, answer: string) => Promise<void>;
  onStatusChange?: (qaPairId: string, status: 'mastered' | 'reviewing') => void;
}

type CardState = 'unanswered' | 'answering' | 'evaluating' | 'reviewed';

export function QuestionCard({ qaPair, onAnswerSubmit, onStatusChange }: QuestionCardProps) {
  const [state, setState] = useState<CardState>('unanswered');
  const [userAnswer, setUserAnswer] = useState('');
  const [showStandardAnswer, setShowStandardAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    learningTips: string[];
  } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const handleStartAnswer = () => {
    setState('answering');
    setStartTime(Date.now());
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('请输入答案');
      return;
    }

    setState('evaluating');
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      if (onAnswerSubmit) {
        await onAnswerSubmit(qaPair.id, userAnswer);
      }

      // 模拟 API 调用 (实际应该调用评估 API)
      // 这里为了演示,使用简单的评分逻辑
      const mockEvaluation = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        feedback: '回答基本正确,包含了主要知识点。',
        strengths: ['理解了核心概念', '表达较为清晰'],
        improvements: ['可以补充更多细节', '注意逻辑连贯性'],
        learningTips: ['继续保持'],
      };

      setEvaluation(mockEvaluation);
      setState('reviewed');
      
      if (onStatusChange) {
        onStatusChange(qaPair.id, mockEvaluation.score >= 80 ? 'mastered' : 'reviewing');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      setState('answering');
      alert('提交失败,请重试');
    }
  };

  const handleReset = () => {
    setState('unanswered');
    setUserAnswer('');
    setShowStandardAnswer(false);
    setEvaluation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className={`transition-all ${evaluation ? getScoreBgColor(evaluation.score) : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{qaPair.question_text}</CardTitle>
            {qaPair.difficulty_level && (
              <CardDescription className="mt-2 flex items-center gap-1">
                难度: {[...Array(qaPair.difficulty_level)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </CardDescription>
            )}
          </div>
          {evaluation && (
            <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 未答题状态 */}
        {state === 'unanswered' && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">点击开始回答这道问题</p>
            <Button onClick={handleStartAnswer}>
              开始回答
            </Button>
          </div>
        )}

        {/* 回答中状态 */}
        {(state === 'answering' || state === 'evaluating') && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                你的答案:
              </label>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请输入你的答案..."
                className="min-h-[150px]"
                disabled={state === 'evaluating'}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitAnswer}
                disabled={state === 'evaluating' || !userAnswer.trim()}
                className="flex-1"
              >
                {state === 'evaluating' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI 评估中...
                  </>
                ) : (
                  '提交答案'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStandardAnswer(!showStandardAnswer)}
                disabled={state === 'evaluating'}
              >
                {showStandardAnswer ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    隐藏答案
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    查看答案
                  </>
                )}
              </Button>
            </div>

            {/* 标准答案 */}
            {showStandardAnswer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">标准答案:</p>
                <p className="text-sm text-blue-800">{qaPair.standard_answer}</p>
              </div>
            )}
          </div>
        )}

        {/* 已评估状态 */}
        {state === 'reviewed' && evaluation && (
          <div className="space-y-4">
            {/* 评分反馈 */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-2">AI 反馈:</h4>
              <p className="text-sm text-gray-700">{evaluation.feedback}</p>
            </div>

            {/* 优点 */}
            {evaluation.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  做得好的地方:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改进建议 */}
            {evaluation.improvements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  可以改进:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-yellow-800">{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 你的答案 */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium mb-2">你的答案:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
            </div>

            {/* 标准答案对比 */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowStandardAnswer(!showStandardAnswer)}
                className="w-full"
              >
                {showStandardAnswer ? '隐藏标准答案' : '查看标准答案'}
              </Button>
              {showStandardAnswer && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">标准答案:</p>
                  <p className="text-sm text-blue-800">{qaPair.standard_answer}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {state === 'reviewed' && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            重新回答
          </Button>
          {evaluation && evaluation.score >= 80 && (
            <Button variant="default" className="flex-1">
              已掌握 ✓
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
