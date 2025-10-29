import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/progress/stats
 * 获取用户学习统计数据
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

    // 获取总卡片数
    const { count: totalCards } = await supabase
      .from('card_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 获取各状态卡片数
    const { data: statusData } = await supabase
      .from('card_status')
      .select('status')
      .eq('user_id', user.id);

    const statusCounts = {
      unanswered: 0,
      reviewing: 0,
      mastered: 0,
    };

    statusData?.forEach(item => {
      if (item.status in statusCounts) {
        statusCounts[item.status as keyof typeof statusCounts]++;
      }
    });

    // 获取平均分
    const { data: attempts } = await supabase
      .from('answer_attempts')
      .select('ai_score')
      .eq('user_id', user.id);

    const avgScore = attempts && attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.ai_score || 0), 0) / attempts.length
      : 0;

    // 获取总答题次数
    const { count: totalAttempts } = await supabase
      .from('answer_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 计算掌握率
    const masteryRate = totalCards && totalCards > 0
      ? (statusCounts.mastered / totalCards) * 100
      : 0;

    // 计算复习率 (最近7天)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentAttempts } = await supabase
      .from('answer_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const reviewRate = totalCards && totalCards > 0
      ? ((recentAttempts || 0) / totalCards) * 100
      : 0;

    return NextResponse.json({
      totalCards: totalCards || 0,
      masteredCards: statusCounts.mastered,
      reviewingCards: statusCounts.reviewing,
      unansweredCards: statusCounts.unanswered,
      avgScore: Math.round(avgScore * 100) / 100,
      masteryRate: Math.round(masteryRate * 100) / 100,
      reviewRate: Math.round(reviewRate * 100) / 100,
      totalAttempts: totalAttempts || 0,
    });
  } catch (error) {
    console.error('获取统计数据API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
