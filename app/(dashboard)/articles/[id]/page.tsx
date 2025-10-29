'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/QuestionCard';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, BookOpen, Calendar, FileText, Loader2, Trash2 } from 'lucide-react';
import type { Article, QAPair } from '@/types';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticleAndQA();
  }, [articleId]);

  const loadArticleAndQA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('请先登录');
        return;
      }

      // 加载文章
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('user_id', session.user.id)
        .single();

      if (articleError) {
        throw new Error('文章不存在或无权访问');
      }

      setArticle(articleData);

      // 加载问答对
      const { data: qaData, error: qaError } = await supabase
        .from('qa_pairs')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (qaError) {
        throw qaError;
      }

      setQaPairs(qaData || []);
    } catch (err: any) {
      console.error('加载失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗?此操作不可恢复。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      router.push('/articles');
    } catch (err: any) {
      alert('删除失败:' + err.message);
    }
  };

  const handleAnswerSubmit = async (qaPairId: string, answer: string) => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{error || '文章不存在'}</p>
          <Button onClick={() => router.push('/articles')}>
            返回文章列表
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          删除文章
        </Button>
      </div>

      {/* 文章信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {article.word_count} 字
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {article.qa_count} 个问答
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">文章内容</h3>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {article.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 问答对列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">问答卡片 ({qaPairs.length})</h3>
        </div>

        {qaPairs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">暂无问答卡片</p>
            <p className="text-sm text-gray-400">
              问答卡片正在生成中,请稍后刷新页面
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {qaPairs.map((qaPair) => (
              <QuestionCard
                key={qaPair.id}
                qaPair={qaPair}
                onAnswerSubmit={handleAnswerSubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
