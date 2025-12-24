# 快速开始指南

## 5 分钟快速启动

### 前置条件
- Node.js 18+ 和 pnpm
- MySQL 8.0+ 或 TiDB
- OpenRouter API Key（[获取地址](https://openrouter.ai/keys)）
- Manus 平台账户

### 步骤 1：克隆和安装

```bash
# 解压项目
unzip ai-ecommerce-image-gen.zip
cd ai-ecommerce-image-gen

# 安装依赖
pnpm install
```

### 步骤 2：配置数据库

```bash
# 创建数据库（本地 MySQL）
mysql -u root -p
CREATE DATABASE ai_ecommerce_image_gen CHARACTER SET utf8mb4;
EXIT;

# 迁移 schema
pnpm db:push
```

### 步骤 3：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 必填项
DATABASE_URL=mysql://root:password@localhost:3306/ai_ecommerce_image_gen
JWT_SECRET=your-32-character-random-string
VITE_APP_ID=your-manus-app-id
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# 可选项（Manus 平台会自动注入）
VITE_APP_TITLE=电商AI商品图生成器
```

详见 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

### 步骤 4：启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`

### 步骤 5：在应用中配置 OpenRouter API Key

1. 点击"设置"按钮
2. 输入 OpenRouter API Key（`sk-or-v1-xxxxx`）
3. 点击"保存"

## 核心功能使用

### 生成商品图

1. 点击"生成商品图"
2. 输入商品描述（例如：白色帆布鞋，简约风格，白色背景）
3. 点击"生成"
4. 等待 AI 生成图片
5. 图片生成后自动保存到历史记录

### 编辑图片

1. 点击"编辑图片"
2. 上传原始图片或从历史记录中选择
3. 输入编辑要求（例如：添加阴影效果）
4. 点击"编辑"
5. 等待 AI 编辑图片

### 查看历史

1. 点击"历史记录"
2. 查看所有生成和编辑的图片
3. 点击图片可以查看详情或下载

## 常用命令

```bash
# 开发
pnpm dev          # 启动开发服务器
pnpm test         # 运行单元测试
pnpm check        # TypeScript 类型检查
pnpm format       # 代码格式化

# 数据库
pnpm db:push      # 迁移数据库 schema
pnpm db:studio    # 打开 Drizzle Studio（数据库管理工具）

# 生产
pnpm build        # 构建项目
pnpm start        # 启动生产服务器
```

## 项目结构速览

```
client/           # React 前端代码
server/           # Express 后端代码
drizzle/          # 数据库 Schema
shared/           # 共享类型和常量
```

## 常见问题

**Q: 启动时出现"数据库连接失败"**
- 检查 MySQL 是否运行
- 检查 `DATABASE_URL` 是否正确
- 确保数据库已创建

**Q: 图片生成失败**
- 检查 OpenRouter API Key 是否正确
- 检查网络连接
- 查看浏览器控制台的错误信息

**Q: 如何修改应用标题？**
- 修改 `.env` 中的 `VITE_APP_TITLE`
- 重启开发服务器

**Q: 如何部署到生产环境？**
- 运行 `pnpm build`
- 配置生产环境变量
- 运行 `pnpm start`

## 下一步

- 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解项目详情
- 查看 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) 了解详细的环境配置
- 查看 [README.md](./README.md) 了解完整文档

## 获取帮助

- 查看项目文档
- 检查浏览器控制台的错误信息
- 查看服务器日志

---

**祝您使用愉快！** 🚀
