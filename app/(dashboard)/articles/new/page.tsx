'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2 } from 'lucide-react';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      setError('仅支持 txt, pdf, docx 格式的文件');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }

    if (!content.trim() && !selectedFile) {
      setError('请输入文章内容或上传文件');
      return;
    }

    setIsLoading(true);

    try {
      let articleContent = content;

      // 如果选择了文件,先上传并提取内容
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('文件上传失败');
        }

        const uploadData = await uploadRes.json();
        articleContent = uploadData.content;
      }

      // 创建文章
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: articleContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '创建文章失败');
      }

      const data = await res.json();
      
      // 跳转到文章详情页
      router.push(`/articles/${data.articleId}`);
    } catch (err: any) {
      setError(err.message || '操作失败,请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">创建新文章</h2>
        <p className="text-gray-600 mt-2">上传或粘贴文章内容,AI 将自动生成问答卡片</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>文章信息</CardTitle>
          <CardDescription>
            支持粘贴文本或上传文件 (txt, pdf, docx)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题输入 */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                文章标题 *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入文章标题"
                disabled={isLoading}
                required
              />
            </div>

            {/* 文件上传 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">上传文件(可选)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    点击上传或拖拽文件到此处
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    支持 TXT, PDF, DOCX 格式,最大 10MB
                  </span>
                </label>

                {selectedFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                文章内容 {!selectedFile && '*'}
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="粘贴或输入文章内容..."
                className="min-h-[300px]"
                disabled={isLoading || !!selectedFile}
              />
              <p className="text-xs text-muted-foreground">
                {content.length} 字符
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '创建文章并生成问答'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 说明卡片 */}
      <Card className="mt-6 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">💡 提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>• AI 会根据文章内容自动生成 3-15 个问答对</p>
          <p>• 文章内容越详细,生成的问答质量越高</p>
          <p>• 生成过程可能需要几秒到几十秒,请耐心等待</p>
          <p>• 生成后您可以在卡片页面查看和答题</p>
        </CardContent>
      </Card>
    </div>
  );
}
