/**
 * Supabase Storage Helper
 * 使用 Supabase Storage API 上传和获取文件
 */

import { ENV } from './_core/env';

interface StorageConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  bucket: string;
}

function getStorageConfig(): StorageConfig {
  const { supabaseUrl, supabaseServiceRoleKey, supabaseStorageBucket } = ENV;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase 配置缺失: 请设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量"
    );
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    supabaseServiceKey: supabaseServiceRoleKey,
    bucket: supabaseStorageBucket || "images",
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * 上传文件到 Supabase Storage
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { supabaseUrl, supabaseServiceKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);

  // Supabase Storage Upload API
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${key}`;

  // 将数据转换为 Buffer
  const buffer = typeof data === "string" ? Buffer.from(data) : data;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseServiceKey}`,
      "Content-Type": contentType,
    },
    body: buffer as unknown as BodyInit,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Supabase Storage 上传失败 (${response.status} ${response.statusText}): ${message}`
    );
  }

  // 生成公开访问 URL
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;

  return { key, url };
}

/**
 * 获取文件的公开访问 URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const { supabaseUrl, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);

  // Supabase Storage 公开 URL
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;

  return { key, url };
}

/**
 * 删除文件（可选功能）
 */
export async function storageDelete(relKey: string): Promise<void> {
  const { supabaseUrl, supabaseServiceKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);

  const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${key}`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${supabaseServiceKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Supabase Storage 删除失败 (${response.status} ${response.statusText}): ${message}`
    );
  }
}
