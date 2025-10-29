'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, CreditCard, TrendingUp, Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">欢迎回来!</h2>
        <p className="text-gray-600 mt-2">开始您的学习之旅</p>
      </div>

      {/* 快捷操作 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/articles/new">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                新建文章
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+</div>
              <p className="text-xs text-muted-foreground">
                上传或粘贴文章开始学习
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              文章总数
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              已创建的学习材料
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              卡片总数
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              生成的问答卡片
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 学习统计 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>学习进度</CardTitle>
            <CardDescription>您的整体学习情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">已掌握</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">复习中</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">未答题</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>您最近的学习记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>暂无学习记录</p>
              <p className="text-sm mt-2">开始创建文章并生成问答卡片吧!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速开始指南 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
          <CardDescription>按照以下步骤开始使用 QuesMind</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">上传学习材料</h4>
                <p className="text-sm text-muted-foreground">
                  粘贴文本或上传文件(支持 txt, pdf, docx)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">AI 自动生成问答</h4>
                <p className="text-sm text-muted-foreground">
                  系统会自动从文章中提取关键知识点并生成问答对
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">开始答题</h4>
                <p className="text-sm text-muted-foreground">
                  回答问题,AI 会实时评分并提供个性化反馈
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium">追踪进度</h4>
                <p className="text-sm text-muted-foreground">
                  查看学习统计,了解您的进步情况
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/articles/new">
              <Button className="w-full">
                开始创建第一篇文章
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
