import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { QAGenerationService } from '@/lib/openai/qa-generation.service';
import { FileProcessingService } from '@/lib/services/file-processing.service';

/**
 * POST /api/articles
 * 创建新文章并生成问答对
 */
export async function POST(request: NextRequest) {
  try {
    // 获取用户认证信息
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从请求体获取数据
    const body = await request.json();
    const { title, content } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户认证失败' },
        { status: 401 }
      );
    }

    // 计算字数
    const wordCount = FileProcessingService.countWords(content);

    // 创建文章记录
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        word_count: wordCount,
      })
      .select()
      .single();

    if (articleError) {
      console.error('创建文章失败:', articleError);
      return NextResponse.json(
        { error: '创建文章失败' },
        { status: 500 }
      );
    }

    // 计算建议生成的问答对数量
    const questionCount = QAGenerationService.calculateRecommendedCount(wordCount);

    // 异步生成问答对
    try {
      const qaPairs = await QAGenerationService.generateQAPairs({
        articleContent: content,
        questionCount,
      });

      // 批量插入问答对
      const qaInsertData = qaPairs.map(pair => ({
        article_id: article.id,
        question_text: pair.question,
        standard_answer: pair.answer,
        difficulty_level: pair.difficulty,
      }));

      const { data: insertedQAPairs, error: qaError } = await supabase
        .from('qa_pairs')
        .insert(qaInsertData)
        .select();

      if (qaError) {
        console.error('插入问答对失败:', qaError);
      } else {
        // 更新文章的 qa_count
        await supabase
          .from('articles')
          .update({ qa_count: insertedQAPairs?.length || 0 })
          .eq('id', article.id);

        // 为每个问答对创建卡片状态
        const cardStatusData = insertedQAPairs?.map(qa => ({
          qa_pair_id: qa.id,
          user_id: user.id,
          status: 'unanswered' as const,
        })) || [];

        if (cardStatusData.length > 0) {
          await supabase.from('card_status').insert(cardStatusData);
        }
      }
    } catch (qaGenError) {
      console.error('生成问答对失败:', qaGenError);
      // 不阻止文章创建,返回警告
    }

    return NextResponse.json({
      articleId: article.id,
      qaCount: questionCount,
      message: '文章创建成功,问答对正在生成中',
    });
  } catch (error) {
    console.error('创建文章API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/articles
 * 获取文章列表
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户认证失败' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 查询文章列表
    const { data: articles, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询文章列表失败:', error);
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      articles: articles || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取文章列表API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
