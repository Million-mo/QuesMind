'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { TrendingUp, Award, Target, Clock, Loader2 } from 'lucide-react';
import type { ProgressStats } from '@/types';

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('请先登录');
        return;
      }

      const response = await fetch('/api/progress/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('加载统计数据失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || '加载失败'}
      </div>
    );
  }

  const masteryPercentage = stats.totalCards > 0
    ? (stats.masteredCards / stats.totalCards) * 100
    : 0;

  const reviewingPercentage = stats.totalCards > 0
    ? (stats.reviewingCards / stats.totalCards) * 100
    : 0;

  const unansweredPercentage = stats.totalCards > 0
    ? (stats.unansweredCards / stats.totalCards) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">学习统计</h2>
        <p className="text-gray-600 mt-2">追踪您的学习进度和成就</p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              总卡片数
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              已生成的问答卡片
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              已掌握
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.masteredCards}
            </div>
            <p className="text-xs text-muted-foreground">
              掌握率 {masteryPercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              平均得分
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              满分 100 分
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              答题次数
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              总共完成的答题
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 学习进度详情 */}
      <Card>
        <CardHeader>
          <CardTitle>学习进度</CardTitle>
          <CardDescription>您的整体学习情况分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 已掌握 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">已掌握</span>
              <span className="text-sm text-muted-foreground">
                {stats.masteredCards} / {stats.totalCards} ({masteryPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${masteryPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* 复习中 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">复习中</span>
              <span className="text-sm text-muted-foreground">
                {stats.reviewingCards} / {stats.totalCards} ({reviewingPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${reviewingPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* 未答题 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">未答题</span>
              <span className="text-sm text-muted-foreground">
                {stats.unansweredCards} / {stats.totalCards} ({unansweredPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-400 h-2 rounded-full transition-all"
                style={{ width: `${unansweredPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学习建议 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>学习建议</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.masteredCards === 0 && stats.totalCards > 0 && (
            <p className="text-sm">💪 开始答题吧!通过主动回忆来巩固知识。</p>
          )}
          {stats.avgScore < 70 && stats.totalAttempts > 0 && (
            <p className="text-sm">📚 建议重新阅读原文,加深理解。</p>
          )}
          {stats.reviewingCards > 5 && (
            <p className="text-sm">
              🔄 您有 {stats.reviewingCards} 张卡片需要复习,继续努力!
            </p>
          )}
          {masteryPercentage >= 80 && (
            <p className="text-sm">🎉 太棒了!您已经掌握了大部分内容!</p>
          )}
          {stats.totalCards === 0 && (
            <p className="text-sm">
              📝 还没有学习卡片,先去创建文章生成问答卡片吧!
            </p>
          )}
        </CardContent>
      </Card>

      {/* 成就徽章 */}
      <Card>
        <CardHeader>
          <CardTitle>成就徽章</CardTitle>
          <CardDescription>根据您的学习表现获得的成就</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 初学者 */}
            <div className={`text-center p-4 rounded-lg ${stats.totalAttempts >= 1 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 opacity-50'}`}>
              <div className="text-3xl mb-2">🎓</div>
              <div className="text-sm font-medium">初学者</div>
              <div className="text-xs text-gray-500">完成首次答题</div>
            </div>

            {/* 勤奋学习 */}
            <div className={`text-center p-4 rounded-lg ${stats.totalAttempts >= 10 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 opacity-50'}`}>
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm font-medium">勤奋学习</div>
              <div className="text-xs text-gray-500">答题10次以上</div>
            </div>

            {/* 知识达人 */}
            <div className={`text-center p-4 rounded-lg ${stats.masteredCards >= 10 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 opacity-50'}`}>
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-medium">知识达人</div>
              <div className="text-xs text-gray-500">掌握10张卡片</div>
            </div>

            {/* 学霸 */}
            <div className={`text-center p-4 rounded-lg ${stats.avgScore >= 90 && stats.totalAttempts >= 5 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 opacity-50'}`}>
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm font-medium">学霸</div>
              <div className="text-xs text-gray-500">平均分≥90</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
