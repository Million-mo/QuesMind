-- QuesMind 行级安全策略 (Row Level Security)
-- 确保用户只能访问自己的数据

-- 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_status ENABLE ROW LEVEL SECURITY;

-- 1. user_profiles 表策略
-- 用户只能查看和更新自己的配置
CREATE POLICY "用户可以查看自己的配置"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的配置"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的配置"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. articles 表策略
-- 用户只能访问自己的文章
CREATE POLICY "用户可以查看自己的文章"
    ON public.articles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建文章"
    ON public.articles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的文章"
    ON public.articles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的文章"
    ON public.articles FOR DELETE
    USING (auth.uid() = user_id);

-- 3. qa_pairs 表策略
-- 用户可以访问自己文章的问答对
CREATE POLICY "用户可以查看自己文章的问答对"
    ON public.qa_pairs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE articles.id = qa_pairs.article_id
            AND articles.user_id = auth.uid()
        )
    );

CREATE POLICY "用户可以创建自己文章的问答对"
    ON public.qa_pairs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE articles.id = qa_pairs.article_id
            AND articles.user_id = auth.uid()
        )
    );

CREATE POLICY "用户可以删除自己文章的问答对"
    ON public.qa_pairs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE articles.id = qa_pairs.article_id
            AND articles.user_id = auth.uid()
        )
    );

-- 4. answer_attempts 表策略
-- 用户只能访问自己的答题记录
CREATE POLICY "用户可以查看自己的答题记录"
    ON public.answer_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建答题记录"
    ON public.answer_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. card_status 表策略
-- 用户只能访问自己的卡片状态
CREATE POLICY "用户可以查看自己的卡片状态"
    ON public.card_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建卡片状态"
    ON public.card_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的卡片状态"
    ON public.card_status FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的卡片状态"
    ON public.card_status FOR DELETE
    USING (auth.uid() = user_id);
