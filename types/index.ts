// 数据库表类型定义

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  file_url?: string;
  word_count: number;
  qa_count: number;
  created_at: string;
  updated_at: string;
}

export interface QAPair {
  id: string;
  article_id: string;
  question_text: string;
  standard_answer: string;
  difficulty_level?: number;
  created_at: string;
}

export interface AnswerAttempt {
  id: string;
  qa_pair_id: string;
  user_id: string;
  user_answer: string;
  ai_score?: number;
  ai_feedback?: string;
  time_spent?: number;
  is_mastered: boolean;
  created_at: string;
}

export type CardStatusType = 'unanswered' | 'reviewing' | 'mastered';

export interface CardStatus {
  id: string;
  qa_pair_id: string;
  user_id: string;
  status: CardStatusType;
  review_count: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  created_at: string;
  updated_at: string;
}

// API 请求/响应类型

export interface CreateArticleRequest {
  title: string;
  content: string;
  file_url?: string;
}

export interface CreateArticleResponse {
  articleId: string;
  qaCount: number;
  message: string;
}

export interface GenerateQARequest {
  articleId: string;
  questionCount?: number;
}

export interface GenerateQAResponse {
  qaPairs: QAPair[];
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface EvaluateAnswerRequest {
  cardId: string;
  userAnswer: string;
  timeSpent?: number;
}

export interface EvaluateAnswerResponse {
  score: number;
  feedback: string;
  suggestions: string[];
  isCorrect: boolean;
}

export interface ProgressStats {
  totalCards: number;
  masteredCards: number;
  reviewingCards: number;
  unansweredCards: number;
  avgScore: number;
  reviewRate: number;
  totalAttempts: number;
}

export interface DailyStats {
  date: string;
  attemptCount: number;
  avgScore: number;
  cardsReviewed: number;
}

// AI 服务相关类型

export interface QAGenerationPrompt {
  articleContent: string;
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GeneratedQAPair {
  question: string;
  answer: string;
  difficulty?: number;
}

export interface AnswerEvaluationPrompt {
  question: string;
  standardAnswer: string;
  userAnswer: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: boolean;
}
