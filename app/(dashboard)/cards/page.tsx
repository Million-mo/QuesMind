'use client';

import { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { Filter, Loader2 } from 'lucide-react';
import type { QAPair, CardStatusType } from '@/types';

type FilterType = 'all' | 'unanswered' | 'reviewing' | 'mastered';

export default function CardsPage() {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCards();
  }, [filter]);

  const loadCards = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('请先登录');
        return;
      }

      // 查询问答对和状态
      let query = supabase
        .from('qa_pairs')
        .select(`
          *,
          articles!inner(user_id),
          card_status(status, review_count, last_reviewed_at)
        `)
        .eq('articles.user_id', session.user.id)
        .order('created_at', { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // 根据筛选条件过滤
      let filteredData = data || [];
      if (filter !== 'all') {
        filteredData = filteredData.filter(qa => {
          const status = qa.card_status?.[0]?.status || 'unanswered';
          return status === filter;
        });
      }

      setQaPairs(filteredData);
    } catch (err: any) {
      console.error('加载卡片失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (qaPairId: string, answer: string) => {
    // 调用评估 API
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch('/api/answers/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        qaPairId,
        userAnswer: answer,
      }),
    });

    if (!response.ok) {
      throw new Error('评估失败');
    }

    // 重新加载卡片以更新状态
    await loadCards();
  };

  const handleStatusChange = async (qaPairId: string, status: CardStatusType) => {
    // 更新卡片状态
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('card_status').upsert({
      qa_pair_id: qaPairId,
      user_id: session.user.id,
      status,
    }, {
      onConflict: 'qa_pair_id,user_id',
    });

    await loadCards();
  };

  const filterButtons: { label: string; value: FilterType; color: string }[] = [
    { label: '全部', value: 'all', color: 'bg-gray-100 text-gray-700' },
    { label: '未答题', value: 'unanswered', color: 'bg-gray-100 text-gray-700' },
    { label: '复习中', value: 'reviewing', color: 'bg-yellow-100 text-yellow-700' },
    { label: '已掌握', value: 'mastered', color: 'bg-green-100 text-green-700' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">问答卡片</h2>
        <p className="text-gray-600 mt-2">通过主动回忆巩固知识</p>
      </div>

      {/* 筛选器 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选:</span>
          {filterButtons.map(({ label, value, color }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
              className={filter === value ? '' : color}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 卡片列表 */}
      {qaPairs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? '还没有问答卡片,先去创建文章吧!'
              : `暂无${filterButtons.find(f => f.value === filter)?.label}卡片`
            }
          </p>
          <Button onClick={() => window.location.href = '/articles/new'}>
            创建文章
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {qaPairs.map((qaPair) => (
            <QuestionCard
              key={qaPair.id}
              qaPair={qaPair}
              onAnswerSubmit={handleAnswerSubmit}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {qaPairs.length > 0 && (
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-900">
              共 {qaPairs.length} 张卡片
            </span>
            <span className="text-blue-700">
              继续加油! 💪
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
