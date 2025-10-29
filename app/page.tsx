import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Brain, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            欢迎使用 <span className="text-primary">QuesMind</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            AI 驱动的主动学习系统
          </p>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
            通过"输入内容 → 生成问答 → 自我测试 → AI 评估 → 记忆巩固"的闭环流程,帮助您高效掌握知识
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto">
                立即开始
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心特性</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">AI 问答生成</h3>
              <p className="text-gray-600 text-sm">
                自动从文章中提取关键知识点并生成高质量问答对
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">智能评估</h3>
              <p className="text-gray-600 text-sm">
                AI 实时评分并提供个性化改进建议,助您精准提升
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">多格式支持</h3>
              <p className="text-gray-600 text-sm">
                支持文本粘贴、TXT、PDF、DOCX 等多种输入方式
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold">进度追踪</h3>
              <p className="text-gray-600 text-sm">
                可视化学习进度,量化学习成果,激励持续进步
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            开启您的高效学习之旅
          </h2>
          <p className="text-lg md:text-xl opacity-90">
            现在注册,立即体验 AI 驱动的主动学习系统
          </p>
          <Link href="/auth/login">
            <Button size="lg" variant="secondary" className="mt-4">
              免费开始使用
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
