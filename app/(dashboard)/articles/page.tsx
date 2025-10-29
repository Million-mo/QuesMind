'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { BookOpen, Calendar, FileText, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Article } from '@/types';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('请先登录');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setArticles(data || []);
    } catch (err: any) {
      console.error('加载文章失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">我的文章</h2>
          <p className="text-gray-600 mt-2">管理您的学习材料</p>
        </div>
        <Link href="/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 文章列表 */}
      {articles.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            还没有文章
          </h3>
          <p className="text-gray-500 mb-6">
            创建第一篇文章,开始您的学习之旅
          </p>
          <Link href="/articles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建文章
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(article.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {article.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>{article.word_count} 字</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>{article.qa_count} 个问答</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {articles.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {articles.length}
                </div>
                <div className="text-xs text-gray-600">篇文章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {articles.reduce((sum, a) => sum + a.qa_count, 0)}
                </div>
                <div className="text-xs text-gray-600">个问答</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {articles.reduce((sum, a) => sum + a.word_count, 0)}
                </div>
                <div className="text-xs text-gray-600">总字数</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              继续创建更多学习材料! 📚
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
