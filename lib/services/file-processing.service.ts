import fs from 'fs/promises';
import path from 'path';

/**
 * 文件处理服务
 * 负责处理不同类型的文件上传和文本提取
 */
export class FileProcessingService {
  private static readonly ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.docx'];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * 验证文件类型
   */
  static isValidFileType(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.ALLOWED_EXTENSIONS.includes(ext);
  }

  /**
   * 验证文件大小
   */
  static isValidFileSize(size: number): boolean {
    return size <= this.MAX_FILE_SIZE;
  }

  /**
   * 从文本文件提取内容
   */
  static async extractFromTxt(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.cleanText(content);
    } catch (error) {
      console.error('读取 TXT 文件失败:', error);
      throw new Error('读取文本文件失败');
    }
  }

  /**
   * 从 PDF 文件提取内容
   */
  static async extractFromPdf(filePath: string): Promise<string> {
    try {
      // 动态导入 pdf-parse
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return this.cleanText(data.text);
    } catch (error) {
      console.error('解析 PDF 文件失败:', error);
      throw new Error('PDF 文件解析失败');
    }
  }

  /**
   * 从 DOCX 文件提取内容
   */
  static async extractFromDocx(filePath: string): Promise<string> {
    try {
      // 动态导入 mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return this.cleanText(result.value);
    } catch (error) {
      console.error('解析 DOCX 文件失败:', error);
      throw new Error('DOCX 文件解析失败');
    }
  }

  /**
   * 根据文件类型提取内容
   */
  static async extractContent(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.txt':
        return this.extractFromTxt(filePath);
      case '.pdf':
        return this.extractFromPdf(filePath);
      case '.docx':
        return this.extractFromDocx(filePath);
      default:
        throw new Error(`不支持的文件类型: ${ext}`);
    }
  }

  /**
   * 清洗文本内容
   */
  private static cleanText(text: string): string {
    return text
      // 移除多余的空白字符
      .replace(/\s+/g, ' ')
      // 移除特殊控制字符
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      // 规范化换行符
      .replace(/\r\n/g, '\n')
      // 移除多余的换行
      .replace(/\n{3,}/g, '\n\n')
      // 去除首尾空白
      .trim();
  }

  /**
   * 计算字数
   */
  static countWords(text: string): number {
    // 中文字符 + 英文单词
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return chineseChars.length + englishWords.length;
  }

  /**
   * 保存上传的文件
   */
  static async saveUploadedFile(
    file: File,
    uploadDir: string
  ): Promise<string> {
    try {
      // 确保上传目录存在
      await fs.mkdir(uploadDir, { recursive: true });

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.name);
      const filename = `${timestamp}-${randomStr}${ext}`;
      const filePath = path.join(uploadDir, filename);

      // 将文件保存到磁盘
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('保存文件失败:', error);
      throw new Error('文件保存失败');
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
      // 不抛出错误,因为文件可能已经不存在
    }
  }
}
