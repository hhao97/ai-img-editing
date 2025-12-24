# 前端模块文档

[根目录](../CLAUDE.md) > **client**

> **最后更新**: 2025-12-23 21:50:24
> **模块类型**: 前端应用（React SPA）

---

## 变更记录 (Changelog)

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-23 | 初始化 | 首次生成前端模块文档 |

---

## 模块职责

前端应用模块负责：

- **用户界面渲染**：基于 React 19 构建的单页应用（SPA）
- **页面路由管理**：使用 Wouter 实现客户端路由
- **API 调用**：通过 tRPC React Query 调用后端服务
- **状态管理**：React Hooks + tRPC 自带 React Query
- **样式呈现**：Tailwind CSS 4 + shadcn/ui 组件库
- **用户交互**：表单处理、文件上传、图片预览、下载等

---

## 入口与启动

### 入口文件

**主入口**：`client/src/main.tsx`

```typescript
// 初始化 React 应用，挂载到 #root DOM 节点
import { createRoot } from 'react-dom/client';
import App from './App';
// 设置 tRPC 客户端、React Query Provider、路由
```

**应用根组件**：`client/src/App.tsx`

```typescript
// 定义路由结构
<Switch>
  <Route path="/" component={Home} />
  <Route path="/generate" component={Generate} />
  <Route path="/edit" component={Edit} />
  <Route path="/history" component={History} />
  <Route path="/settings" component={Settings} />
  <Route path="/404" component={NotFound} />
</Switch>
```

### 本地开发

```bash
# 在项目根目录运行（会自动启动前端 Vite 开发服务器）
pnpm dev

# 访问：http://localhost:3000
```

---

## 对外接口

前端通过 **tRPC React Query** 调用后端 API，主要接口：

### 认证相关

- `trpc.auth.me.useQuery()`：获取当前用户信息
- `trpc.auth.logout.useMutation()`：用户登出

### 图片生成

- `trpc.images.generate.useMutation()`：生成商品图
  - **输入**：`{ prompt: string, apiKey: string }`
  - **输出**：`{ success: boolean, imageUrl: string }`

### 图片编辑

- `trpc.images.edit.useMutation()`：编辑图片
  - **输入**：`{ imageUrl: string, editPrompt: string, apiKey: string }`
  - **输出**：`{ success: boolean, editedImageUrl: string }`

### 历史记录

- `trpc.images.getHistory.useQuery({ limit: 20 })`：获取生成历史
- `trpc.images.getEditHistory.useQuery({ limit: 20 })`：获取编辑历史

### 文件上传

- `trpc.images.uploadImage.useMutation()`：上传图片到 S3
  - **输入**：`{ fileName: string, fileData: string (base64), mimeType: string }`

---

## 关键依赖与配置

### 核心依赖

```json
{
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "@trpc/react-query": "11.6.0",
  "@tanstack/react-query": "5.90.2",
  "wouter": "3.3.5",
  "tailwindcss": "4.1.14",
  "lucide-react": "0.453.0",
  "sonner": "2.0.7",
  "framer-motion": "12.23.22"
}
```

### Vite 配置

**文件**：`/vite.config.ts`（项目根目录）

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public")
  }
});
```

### TypeScript 配置

**文件**：`/tsconfig.json`（项目根目录）

- **包含**：`client/src/**/*`、`shared/**/*`
- **路径别名**：
  - `@/*` → `./client/src/*`
  - `@shared/*` → `./shared/*`

---

## 目录结构

```
client/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 主页（商品图生成入口）
│   │   ├── Generate.tsx    # 图片生成页面
│   │   ├── Edit.tsx        # 图片编辑页面
│   │   ├── History.tsx     # 历史记录页面
│   │   ├── Settings.tsx    # 设置页面（API Key 管理）
│   │   ├── NotFound.tsx    # 404 页面
│   │   └── ComponentShowcase.tsx  # 组件展示页（开发用）
│   │
│   ├── components/         # 复用组件
│   │   ├── ui/             # shadcn/ui 组件库（70+ 组件）
│   │   ├── AIChatBox.tsx   # AI 聊天框组件
│   │   ├── Map.tsx         # 地图组件
│   │   ├── DashboardLayout.tsx  # 仪表盘布局
│   │   ├── ErrorBoundary.tsx    # 错误边界
│   │   └── ManusDialog.tsx      # Manus 对话框
│   │
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useMobile.tsx   # 移动端检测
│   │   ├── usePersistFn.ts # 持久化函数引用
│   │   └── useComposition.ts  # 输入法组合事件
│   │
│   ├── contexts/           # React Context
│   │   └── ThemeContext.tsx  # 主题上下文（暗色/亮色模式）
│   │
│   ├── lib/                # 工具库
│   │   ├── trpc.ts         # tRPC 客户端配置
│   │   └── utils.ts        # 工具函数（cn、clsx 等）
│   │
│   ├── _core/              # 框架核心（Manus）
│   │   └── hooks/
│   │       └── useAuth.ts  # 用户认证 Hook
│   │
│   ├── const.ts            # 前端常量（登录 URL 等）
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 应用根组件
│   └── index.css           # 全局样式
│
├── public/                 # 静态资源
│   └── .gitkeep
│
└── index.html              # HTML 模板
```

---

## 数据流

### 页面数据流示例（图片生成）

1. **用户输入**：在 `Home.tsx` 或 `Generate.tsx` 输入 prompt 和 API Key
2. **API 调用**：点击"生成图片"按钮，触发 `trpc.images.generate.useMutation()`
3. **后端处理**：tRPC 请求发送到 `/api/trpc/images.generate`
4. **加载状态**：React Query 自动管理 `isLoading`、`isError`、`data` 状态
5. **结果展示**：成功后显示图片，失败则显示错误 Toast

### API Key 管理流程

- **存储**：保存到 `localStorage.setItem("openrouter_api_key", key)`
- **读取**：每次页面加载从 `localStorage.getItem("openrouter_api_key")` 读取
- **传递**：API 调用时作为参数传递，不暴露在 URL 或 Cookie 中

---

## 测试与质量

### 测试现状

- **单元测试**：前端组件暂无单元测试覆盖
- **E2E 测试**：暂无
- **手动测试**：通过浏览器手动验证功能

### 代码质量工具

- **Prettier**：代码格式化（配置：`.prettierrc`）
- **TypeScript**：类型检查（`pnpm check`）
- **ESLint**：暂无配置（可扩展）

---

## 常见问题 (FAQ)

### Q1: 如何添加新页面？

1. 在 `client/src/pages/` 创建新组件（如 `NewPage.tsx`）
2. 在 `client/src/App.tsx` 的 `<Switch>` 中添加路由：
   ```tsx
   <Route path="/new-page" component={NewPage} />
   ```
3. 在导航菜单或主页添加链接

### Q2: 如何使用 tRPC 调用后端 API？

```tsx
import { trpc } from '@/lib/trpc';

function MyComponent() {
  // Query（获取数据）
  const { data, isLoading } = trpc.images.getHistory.useQuery({ limit: 10 });

  // Mutation（修改数据）
  const generateMutation = trpc.images.generate.useMutation();

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync({
      prompt: 'My prompt',
      apiKey: 'sk-xxx'
    });
  };

  return <div>...</div>;
}
```

### Q3: 如何修改主题配色？

1. 编辑 `client/src/index.css` 中的 CSS 变量
2. 修改 Tailwind 配置（如需自定义类）
3. 使用 `ThemeContext` 切换亮色/暗色模式

### Q4: shadcn/ui 组件如何使用？

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function MyForm() {
  return (
    <div>
      <Input placeholder="请输入..." />
      <Button variant="default">提交</Button>
    </div>
  );
}
```

---

## 相关文件清单

### 核心页面（7 个）

- `src/pages/Home.tsx`：主页，商品图生成入口
- `src/pages/Generate.tsx`：图片生成页面
- `src/pages/Edit.tsx`：图片编辑页面
- `src/pages/History.tsx`：历史记录查看
- `src/pages/Settings.tsx`：设置页面（API Key 管理）
- `src/pages/NotFound.tsx`：404 页面
- `src/pages/ComponentShowcase.tsx`：组件展示（开发调试）

### 核心组件（10+ 个）

- `src/components/ui/`：70+ shadcn/ui 组件（button、input、dialog、card 等）
- `src/components/DashboardLayout.tsx`：仪表盘布局框架
- `src/components/ErrorBoundary.tsx`：错误边界
- `src/components/AIChatBox.tsx`：AI 聊天框
- `src/components/Map.tsx`：地图组件

### 工具与配置（6 个）

- `src/lib/trpc.ts`：tRPC 客户端初始化
- `src/lib/utils.ts`：通用工具函数
- `src/const.ts`：前端常量
- `src/main.tsx`：应用入口
- `src/App.tsx`：应用根组件
- `src/index.css`：全局样式

---

**上级文档**：[根目录 CLAUDE.md](../CLAUDE.md)
**相关模块**：[后端模块](../server/CLAUDE.md) | [数据库模块](../drizzle/CLAUDE.md)
