'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'file' | 'url'>('text');
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
    setInputMode('file');
    setUrl('');
    setError('');
  };

  const handleModeChange = (mode: 'text' | 'file' | 'url') => {
    setInputMode(mode);
    setError('');
    if (mode !== 'file') {
      setSelectedFile(null);
    }
    if (mode !== 'url') {
      setUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }

    // 根据输入模式验证
    if (inputMode === 'text' && !content.trim()) {
      setError('请输入文章内容');
      return;
    }

    if (inputMode === 'file' && !selectedFile) {
      setError('请选择要上传的文件');
      return;
    }

    if (inputMode === 'url' && !url.trim()) {
      setError('请输入文章URL');
      return;
    }

    setIsLoading(true);

    try {
      let articleContent = content;

      // 如果选择了文件,先上传并提取内容
      if (inputMode === 'file' && selectedFile) {
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

      // 如果提供了URL,先抓取内容
      if (inputMode === 'url' && url.trim()) {
        const urlRes = await fetch('/api/files/fetch-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url.trim() }),
        });

        if (!urlRes.ok) {
          const errorData = await urlRes.json();
          throw new Error(errorData.error || 'URL内容获取失败');
        }

        const urlData = await urlRes.json();
        articleContent = urlData.content;
        if (!title.trim() && urlData.title) {
          setTitle(urlData.title);
        }
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
            支持粘贴文本、上传文件或从网址导入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 输入模式选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">输入方式</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('text')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  文本输入
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('file')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  文件上传
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('url')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  网址导入
                </Button>
              </div>
            </div>
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

            {/* URL输入 */}
            {inputMode === 'url' && (
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  网页地址 *
                </label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  输入文章网页链接,系统将自动提取内容
                </p>
              </div>
            )}

            {/* 文件上传 */}
            {inputMode === 'file' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">上传文件 *</label>
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
            )}

            {/* 内容输入 */}
            {inputMode === 'text' && (
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  文章内容 *
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="粘贴或输入文章内容..."
                  className="min-h-[300px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {content.length} 字符
                </p>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
                    <span className="text-destructive text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-1">错误</p>
                    <div className="text-sm text-destructive/90 whitespace-pre-line">
                      {error}
                    </div>
                    {error.includes('403') && (
                      <div className="mt-3 pt-3 border-t border-destructive/20">
                        <p className="text-xs font-medium text-destructive/80 mb-2">备选方案:</p>
                        <ul className="text-xs text-destructive/70 space-y-1 list-disc list-inside">
                          <li>在浏览器中打开文章,复制全文后切换到"文本输入"模式粘贴</li>
                          <li>将网页另存为 PDF,然后使用"文件上传"功能</li>
                          <li>等待 1-2 分钟后重新尝试</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
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
          <p>• 支持三种输入方式:直接输入文本、上传文档或从网页导入</p>
          <p>• 文章内容越详细,生成的问答质量越高</p>
          <p>• 生成过程可能需要几秒到几十秒,请耐心等待</p>
          <p>• 生成后您可以在卡片页面查看和答题</p>
        </CardContent>
      </Card>

      {/* URL 导入说明 */}
      {inputMode === 'url' && (
        <Card className="mt-4 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">🔗 URL 导入说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900">
            <div>
              <p className="font-medium mb-1">✅ 支持的网站:</p>
              <p className="text-xs text-amber-800">
CSDN、掏金、简书、博客园、SegmentFault 等技术博客，以及大部分公开的新闻和文章网站
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">⚠️ 限制说明:</p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>部分网站(如知乎)可能有反爬虫保护,如失败请使用复制粘贴</li>
                <li>需要登录的内容无法抓取,请手动复制</li>
                <li>建议使用文章直链而非列表页</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">💡 失败后的备选方案:</p>
              <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                <li>在浏览器中打开文章,全选复制 (Ctrl+A, Ctrl+C)</li>
                <li>切换到"文本输入"模式,粘贴内容 (Ctrl+V)</li>
                <li>或将网页另存为 PDF 后使用"文件上传"功能</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
