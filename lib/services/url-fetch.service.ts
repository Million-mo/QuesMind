import * as cheerio from 'cheerio';

/**
 * URL内容抓取服务
 * 负责从网页URL提取文章内容
 */
export class UrlFetchService {
  // 常见浏览器 User-Agent 列表
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];

  // 特定网站的选择器配置
  private static readonly SITE_SELECTORS: Record<string, string[]> = {
    'zhihu.com': ['.RichText', '.Post-RichText', '.ArticleItem-content', 'article'],
    'csdn.net': ['#content_views', '.blog-content-box', 'article'],
    'jianshu.com': ['.article', '.show-content'],
    'juejin.cn': ['.article-content', '.markdown-body'],
    'segmentfault.com': ['.article__content', '.article-content'],
    'cnblogs.com': ['#cnblogs_post_body', '.post-body'],
  };
  /**
   * 验证URL格式
   */
  static isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * 获取随机 User-Agent
   */
  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  /**
   * 获取网站域名
   */
  private static getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  /**
   * 构建请求头
   */
  private static buildHeaders(url: string): HeadersInit {
    const domain = this.getDomain(url);
    const headers: HeadersInit = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    // 为特定网站添加 Referer
    if (domain) {
      headers['Referer'] = `https://${domain}/`;
    }

    return headers;
  }

  /**
   * 带重试的 fetch 请求
   */
  private static async fetchWithRetry(
    url: string,
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          headers: this.buildHeaders(url),
          signal: AbortSignal.timeout(30000), // 30秒超时
          redirect: 'follow',
        });

        if (response.ok) {
          return response;
        }

        // 如果是 403/429,等待后重试
        if (response.status === 403 || response.status === 429) {
          if (i < maxRetries - 1) {
            await this.delay(1000 * (i + 1)); // 递增延迟
            continue;
          }
        }

        throw new Error(`HTTP错误: ${response.status}`);
      } catch (error: any) {
        lastError = error;
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          throw new Error('请求超时,请检查网络连接或稍后重试');
        }
        if (i < maxRetries - 1) {
          await this.delay(1000 * (i + 1));
        }
      }
    }

    throw lastError || new Error('请求失败');
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 从URL抓取内容
   */
  static async fetchContent(url: string): Promise<{
    url: string;
    title: string;
    content: string;
    wordCount: number;
  }> {
    try {
      // 发起HTTP请求(带重试)
      const response = await this.fetchWithRetry(url);

      const html = await response.text();

      // 使用cheerio解析HTML
      const $ = cheerio.load(html);

      // 移除脚本、样式等不需要的元素
      $('script, style, nav, header, footer, aside, iframe, noscript').remove();
      $('.advertisement, .ads, .sidebar, .menu, .navigation').remove();

      // 提取标题
      let title = $('title').text().trim();
      if (!title) {
        title = $('h1').first().text().trim();
      }
      if (!title) {
        title = new URL(url).hostname;
      }

      // 提取主要内容
      let content = '';

      // 获取网站特定的选择器
      const domain = this.getDomain(url);
      let selectors: string[] = [];

      // 检查是否有特定网站的选择器配置
      for (const [site, siteSelectors] of Object.entries(this.SITE_SELECTORS)) {
        if (domain.includes(site)) {
          selectors = [...siteSelectors];
          break;
        }
      }

      // 添加通用选择器作为后备
      selectors.push(
        'article',
        '[role="main"]',
        'main',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        '#content',
        '.main-content'
      );

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 100) {
            break;
          }
        }
      }

      // 如果上述选择器都找不到内容,使用body
      if (!content || content.length < 100) {
        content = $('body').text().trim();
      }

      // 清理内容
      content = this.cleanContent(content);

      if (!content || content.length < 50) {
        throw new Error(
          '未能提取到足够的内容。可能原因:\n' +
          '1. 该网站需要登录才能访问\n' +
          '2. 该网站有严格的反爬虫保护\n' +
          '3. URL不是文章页面\n' +
          '建议: 尝试复制文章内容直接粘贴,或下载为文件后上传'
        );
      }

      // 计算字数
      const wordCount = this.countWords(content);

      return {
        url,
        title,
        content,
        wordCount,
      };
    } catch (error: any) {
      // 如果错误已经是友好的错误消息,直接抛出
      if (error.message && !error.message.includes('HTTP错误')) {
        throw error;
      }

      // 针对常见错误提供更友好的提示
      if (error.message?.includes('403')) {
        throw new Error(
          '访问被拒绝(403)。该网站可能:\n' +
          '1. 检测到自动化访问\n' +
          '2. 需要登录才能查看\n' +
          '3. 限制了爬虫访问\n' +
          '建议: 复制文章内容直接粘贴,或截图/下载后上传文件'
        );
      }

      if (error.message?.includes('429')) {
        throw new Error('请求过于频繁,请稍后再试(1-2分钟后)');
      }

      if (error.message?.includes('404')) {
        throw new Error('页面不存在,请检查URL是否正确');
      }

      if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
        throw new Error('目标网站服务器错误,请稍后重试');
      }

      throw new Error(`抓取失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 清理文本内容
   */
  private static cleanContent(text: string): string {
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
  private static countWords(text: string): number {
    // 中文字符 + 英文单词
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return chineseChars.length + englishWords.length;
  }
}
