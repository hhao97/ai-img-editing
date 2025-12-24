-- ============================================
-- 电商AI商品图生成器 - MySQL DDL
-- ============================================
-- 数据库创建语句
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `ai_ecommerce_image_gen` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `ai_ecommerce_image_gen`;

-- ============================================
-- 表 1: users (用户表)
-- ============================================
-- 存储用户信息，与 Manus OAuth 关联
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL COMMENT '用户 ID，主键',
  `openId` varchar(64) NOT NULL COMMENT 'OAuth 用户 ID，唯一',
  `name` text COMMENT '用户名',
  `email` varchar(320) COMMENT '邮箱',
  `loginMethod` varchar(64) COMMENT '登录方式',
  `role` enum('user','admin') NOT NULL DEFAULT 'user' COMMENT '用户角色',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后登录时间',
  CONSTRAINT `users_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 表 2: imageGenerations (图片生成记录表)
-- ============================================
-- 存储用户生成的图片记录
CREATE TABLE IF NOT EXISTS `imageGenerations` (
  `id` int AUTO_INCREMENT NOT NULL COMMENT '记录 ID，主键',
  `userId` int NOT NULL COMMENT '用户 ID，外键',
  `prompt` text NOT NULL COMMENT '生成的 prompt 描述',
  `imageUrl` text NOT NULL COMMENT '生成的图片 URL (S3)',
  `imageKey` varchar(512) COMMENT 'S3 文件 key',
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending' COMMENT '生成状态',
  `errorMessage` text COMMENT '错误信息',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  CONSTRAINT `imageGenerations_id` PRIMARY KEY(`id`),
  CONSTRAINT `imageGenerations_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片生成记录表';

-- ============================================
-- 表 3: imageEdits (图片编辑记录表)
-- ============================================
-- 存储用户编辑的图片记录
CREATE TABLE IF NOT EXISTS `imageEdits` (
  `id` int AUTO_INCREMENT NOT NULL COMMENT '记录 ID，主键',
  `userId` int NOT NULL COMMENT '用户 ID，外键',
  `originalImageUrl` text NOT NULL COMMENT '原始图片 URL',
  `originalImageKey` varchar(512) COMMENT '原始图片 S3 key',
  `editPrompt` text NOT NULL COMMENT '编辑要求描述',
  `editedImageUrl` text NOT NULL COMMENT '编辑后的图片 URL (S3)',
  `editedImageKey` varchar(512) COMMENT '编辑后的图片 S3 key',
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending' COMMENT '编辑状态',
  `errorMessage` text COMMENT '错误信息',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  CONSTRAINT `imageEdits_id` PRIMARY KEY(`id`),
  CONSTRAINT `imageEdits_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片编辑记录表';

-- ============================================
-- 索引优化
-- ============================================
-- 为常见查询添加索引
ALTER TABLE `imageGenerations` ADD INDEX `idx_userId_createdAt` (`userId`, `createdAt` DESC);
ALTER TABLE `imageEdits` ADD INDEX `idx_userId_createdAt` (`userId`, `createdAt` DESC);

-- ============================================
-- 初始数据（可选）
-- ============================================
-- 如果需要，可以在这里添加初始数据
-- INSERT INTO `users` (`openId`, `name`, `email`, `role`) VALUES ('test-user-1', 'Test User', 'test@example.com', 'user');

-- ============================================
-- 完成
-- ============================================
-- 数据库初始化完成
-- 所有表已创建，外键关系已建立
-- 可以开始使用应用
