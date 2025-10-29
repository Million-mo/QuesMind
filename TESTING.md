# QuesMind 测试指南

## 测试概述

本项目包含单元测试和集成测试框架。

## 安装测试依赖

```bash
npm install --save-dev jest @jest/globals @testing-library/react @testing-library/jest-dom
npm install --save-dev @types/jest
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage

# 监听模式运行测试
npm test -- --watch
```

## 测试结构

```
__tests__/
├── utils.test.ts           # 工具函数测试
├── services/
│   ├── qa-generation.test.ts    # 问答生成服务测试
│   └── file-processing.test.ts  # 文件处理服务测试
└── components/
    ├── QuestionCard.test.tsx     # 卡片组件测试
    └── Button.test.tsx           # 按钮组件测试
```

## 测试覆盖范围

### 单元测试
- ✅ 工具函数测试示例
- 🔄 服务类测试 (待完善)
- 🔄 组件测试 (待完善)

### 集成测试
- 🔄 API 端点测试 (待实现)
- 🔄 数据库操作测试 (待实现)

### E2E 测试
- 🔄 用户流程测试 (可选,使用 Playwright)

## 测试最佳实践

1. **每个功能模块都应有对应测试**
2. **测试应该独立且可重复**
3. **使用描述性的测试名称**
4. **模拟外部依赖 (API, 数据库)**

## Mock 示例

```typescript
// Mock Supabase 客户端
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock OpenAI API
jest.mock('openai', () => ({
  OpenAI: jest.fn(),
}));
```

## 注意事项

- 测试不应依赖真实的 API Key
- 使用 Mock 数据代替真实数据库
- 测试环境变量应单独配置

## 未来改进

- [ ] 增加更多单元测试
- [ ] 实现 API 集成测试
- [ ] 添加组件快照测试
- [ ] 配置 CI/CD 自动测试
