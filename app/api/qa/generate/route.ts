import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { QAGenerationService } from '@/lib/openai/qa-generation.service';

/**
 * POST /api/qa/generate
 * 为指定文章生成问答对
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { articleId, questionCount } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: '缺少文章 ID' },
        { status: 400 }
      );
    }

    // 获取文章内容
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .eq('user_id', user.id)
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        { error: '文章不存在或无权访问' },
        { status: 404 }
      );
    }

    // 计算建议的问答数量
    const recommendedCount = questionCount || 
      QAGenerationService.calculateRecommendedCount(article.word_count);

    // 生成问答对
    const qaPairs = await QAGenerationService.generateQAPairs({
      articleContent: article.content,
      questionCount: recommendedCount,
    });

    // 批量插入问答对
    const qaInsertData = qaPairs.map(pair => ({
      article_id: articleId,
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
      return NextResponse.json(
        { error: '保存问答对失败' },
        { status: 500 }
      );
    }

    // 更新文章的 qa_count
    await supabase
      .from('articles')
      .update({ qa_count: insertedQAPairs?.length || 0 })
      .eq('id', articleId);

    // 为每个问答对创建卡片状态
    const cardStatusData = insertedQAPairs?.map(qa => ({
      qa_pair_id: qa.id,
      user_id: user.id,
      status: 'unanswered' as const,
    })) || [];

    if (cardStatusData.length > 0) {
      await supabase.from('card_status').insert(cardStatusData);
    }

    return NextResponse.json({
      qaPairs: insertedQAPairs,
      count: insertedQAPairs?.length || 0,
      message: '问答对生成成功',
    });
  } catch (error) {
    console.error('问答生成API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qa/status/[jobId]
 * 查询问答生成进度
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: '缺少文章 ID' },
        { status: 400 }
      );
    }

    // 查询问答对数量
    const { count, error } = await supabase
      .from('qa_pairs')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) {
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      articleId,
      qaCount: count || 0,
      status: (count || 0) > 0 ? 'completed' : 'pending',
    });
  } catch (error) {
    console.error('查询问答状态错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
