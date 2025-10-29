/**
 * URL 抓取功能测试脚本
 * 
 * 使用方法:
 * npx tsx scripts/test-url-fetch.ts
 */

import { UrlFetchService } from '../lib/services/url-fetch.service';

// 测试 URL 列表
const testUrls = [
  {
    name: 'CSDN 博客',
    url: 'https://blog.csdn.net/xxx/article/details/xxx',
    description: '技术博客示例',
  },
  {
    name: '掘金文章',
    url: 'https://juejin.cn/post/xxx',
    description: '前端技术文章',
  },
  {
    name: '简书文章',
    url: 'https://www.jianshu.com/p/xxx',
    description: '个人创作',
  },
  {
    name: '知乎专栏',
    url: 'https://zhuanlan.zhihu.com/p/xxx',
    description: '专业内容',
  },
];

async function testUrlFetch(url: string, name: string) {
  console.log(`\n测试 ${name}...`);
  console.log(`URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const result = await UrlFetchService.fetchContent(url);
    const duration = Date.now() - startTime;
    
    console.log('✅ 成功!');
    console.log(`标题: ${result.title}`);
    console.log(`字数: ${result.wordCount}`);
    console.log(`内容长度: ${result.content.length} 字符`);
    console.log(`耗时: ${duration}ms`);
    console.log(`内容预览: ${result.content.substring(0, 100)}...`);
    
    return { success: true, duration };
  } catch (error: any) {
    console.log('❌ 失败!');
    console.log(`错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('====================================');
  console.log('URL 抓取功能测试');
  console.log('====================================');
  
  const results = [];
  
  for (const test of testUrls) {
    const result = await testUrlFetch(test.url, test.name);
    results.push({ ...test, ...result });
    
    // 延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n====================================');
  console.log('测试总结');
  console.log('====================================');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`总测试数: ${totalCount}`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${totalCount - successCount}`);
  console.log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  console.log('\n详细结果:');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}: ${r.success ? '✅' : '❌'} ${r.success ? `(${r.duration}ms)` : `(${r.error})`}`);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('请将测试 URL 替换为实际的文章链接后运行测试\n');
  console.log('示例:');
  console.log('const testUrls = [');
  console.log('  {');
  console.log('    name: "CSDN 博客",');
  console.log('    url: "https://blog.csdn.net/weixin_12345678/article/details/123456789",');
  console.log('    description: "实际的 CSDN 文章链接",');
  console.log('  },');
  console.log('  // ... 更多测试链接');
  console.log('];');
  console.log('\n然后运行: npx tsx scripts/test-url-fetch.ts');
}

export { testUrlFetch, runTests };
