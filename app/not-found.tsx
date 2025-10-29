import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">404 - 页面未找到</CardTitle>
          <CardDescription>
            抱歉,您访问的页面不存在
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button className="w-full">
              返回首页
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
