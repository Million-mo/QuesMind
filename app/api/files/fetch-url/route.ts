import { NextRequest, NextResponse } from 'next/server';
import { UrlFetchService } from '@/lib/services/url-fetch.service';

/**
 * POST /api/files/fetch-url
 * 从URL抓取网页内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: '请提供URL' },
        { status: 400 }
      );
    }

    // 验证URL格式
    if (!UrlFetchService.isValidUrl(url)) {
      return NextResponse.json(
        { error: '无效的URL格式' },
        { status: 400 }
      );
    }

    // 抓取内容
    try {
      const result = await UrlFetchService.fetchContent(url);

      return NextResponse.json({
        url: result.url,
        title: result.title,
        content: result.content,
        wordCount: result.wordCount,
        message: '内容获取成功',
      });
    } catch (fetchError: any) {
      console.error('URL内容抓取失败:', fetchError);
      return NextResponse.json(
        { error: fetchError.message || '无法获取网页内容,请检查URL是否可访问' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('URL抓取API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
