-- QuesMind 数据库表结构设计
-- 创建时间: 2025-10-29

-- 1. 用户表 (由 Supabase Auth 自动管理,这里仅作参考)
-- auth.users 表已由 Supabase 创建

-- 2. 用户配置表 (扩展用户信息)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 文章表
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,
    word_count INTEGER DEFAULT 0,
    qa_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 问答对表
CREATE TABLE IF NOT EXISTS public.qa_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    standard_answer TEXT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 答题记录表
CREATE TABLE IF NOT EXISTS public.answer_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qa_pair_id UUID NOT NULL REFERENCES public.qa_pairs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    ai_score DECIMAL(5,2) CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_feedback TEXT,
    time_spent INTEGER, -- 答题用时(秒)
    is_mastered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 卡片状态表
CREATE TABLE IF NOT EXISTS public.card_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qa_pair_id UUID NOT NULL REFERENCES public.qa_pairs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('unanswered', 'reviewing', 'mastered')) DEFAULT 'unanswered',
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(qa_pair_id, user_id)
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_article_id ON public.qa_pairs(article_id);
CREATE INDEX IF NOT EXISTS idx_answer_attempts_user_id ON public.answer_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_attempts_qa_pair_id ON public.answer_attempts(qa_pair_id);
CREATE INDEX IF NOT EXISTS idx_card_status_user_id ON public.card_status(user_id);
CREATE INDEX IF NOT EXISTS idx_card_status_next_review ON public.card_status(next_review_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_status_updated_at
    BEFORE UPDATE ON public.card_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
