import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { AnswerEvaluationService } from '@/lib/openai/answer-evaluation.service';

/**
 * POST /api/answers/evaluate
 * 评估用户答案
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
    const { qaPairId, userAnswer, timeSpent } = body;

    if (!qaPairId || !userAnswer) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取问答对信息
    const { data: qaPair, error: qaPairError } = await supabase
      .from('qa_pairs')
      .select('*, articles!inner(user_id)')
      .eq('id', qaPairId)
      .single();

    if (qaPairError || !qaPair) {
      return NextResponse.json(
        { error: '问答对不存在' },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (qaPair.articles.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权访问此问答对' },
        { status: 403 }
      );
    }

    // 调用 AI 评估
    const evaluation = await AnswerEvaluationService.evaluateAnswer({
      question: qaPair.question_text,
      standardAnswer: qaPair.standard_answer,
      userAnswer: userAnswer.trim(),
    });

    // 生成学习建议
    const learningTips = AnswerEvaluationService.generateLearningTips(evaluation);

    // 保存答题记录
    const { data: attempt, error: attemptError } = await supabase
      .from('answer_attempts')
      .insert({
        qa_pair_id: qaPairId,
        user_id: user.id,
        user_answer: userAnswer.trim(),
        ai_score: evaluation.score,
        ai_feedback: evaluation.feedback,
        time_spent: timeSpent || null,
        is_mastered: evaluation.score >= 80,
      })
      .select()
      .single();

    if (attemptError) {
      console.error('保存答题记录失败:', attemptError);
    }

    // 更新卡片状态
    const newStatus = evaluation.score >= 80 ? 'mastered' : 'reviewing';
    
    const { error: statusError } = await supabase
      .from('card_status')
      .upsert({
        qa_pair_id: qaPairId,
        user_id: user.id,
        status: newStatus,
        review_count: supabase.raw('review_count + 1'),
        last_reviewed_at: new Date().toISOString(),
        // 计算下次复习时间 (简单的间隔重复算法)
        next_review_at: new Date(
          Date.now() + (evaluation.score >= 80 ? 3 : 1) * 24 * 60 * 60 * 1000
        ).toISOString(),
      }, {
        onConflict: 'qa_pair_id,user_id',
      });

    if (statusError) {
      console.error('更新卡片状态失败:', statusError);
    }

    return NextResponse.json({
      attemptId: attempt?.id,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      learningTips,
      isCorrect: evaluation.score >= 60,
      isMastered: evaluation.score >= 80,
      message: '评估完成',
    });
  } catch (error) {
    console.error('答案评估API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/answers/history
 * 获取答题历史
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

    const searchParams = request.nextUrl.searchParams;
    const qaPairId = searchParams.get('qaPairId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('answer_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (qaPairId) {
      query = query.eq('qa_pair_id', qaPairId);
    }

    const { data: attempts, error } = await query;

    if (error) {
      console.error('查询答题历史失败:', error);
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    // 计算平均分
    const avgScore = attempts && attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.ai_score || 0), 0) / attempts.length
      : 0;

    return NextResponse.json({
      attempts: attempts || [],
      total: attempts?.length || 0,
      avgScore: Math.round(avgScore * 100) / 100,
    });
  } catch (error) {
    console.error('获取答题历史API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
