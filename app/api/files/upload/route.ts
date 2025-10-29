import { NextRequest, NextResponse } from 'next/server';
import { FileProcessingService } from '@/lib/services/file-processing.service';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

/**
 * POST /api/files/upload
 * 上传文件并提取内容
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未选择文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!FileProcessingService.isValidFileType(file.name)) {
      return NextResponse.json(
        { error: '不支持的文件类型,仅支持 txt, pdf, docx' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (!FileProcessingService.isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: '文件大小超过 10MB 限制' },
        { status: 400 }
      );
    }

    // 创建临时目录
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // 保存文件到磁盘
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 提取文件内容
    let content: string;
    try {
      content = await FileProcessingService.extractContent(filePath);
    } catch (extractError) {
      console.error('文件内容提取失败:', extractError);
      // 删除临时文件
      await FileProcessingService.deleteFile(filePath);
      return NextResponse.json(
        { error: '文件内容提取失败,请确保文件格式正确' },
        { status: 400 }
      );
    }

    // 计算字数
    const wordCount = FileProcessingService.countWords(content);

    // 删除临时文件
    await FileProcessingService.deleteFile(filePath);

    return NextResponse.json({
      filename: file.name,
      content,
      wordCount,
      size: file.size,
      message: '文件上传成功',
    });
  } catch (error) {
    console.error('文件上传API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
