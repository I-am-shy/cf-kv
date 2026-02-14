import { z } from 'zod';
import type { CloudflareClient } from './middleware/auth';

/**
 * @description 环境变量
 */
export interface Env {
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  PORT?: string;
  MAX_BODY_SIZE?: string;
}

/**
 * Hono 变量
 * @property {CloudflareClient} cf - Cloudflare 客户端
 */
export type Variables = {
  cf: CloudflareClient;
};

/**
 * Cloudflare API 响应类型
 * @property {boolean} success - 是否成功
 * @property {Array<{ code: number; message: string }>} errors - 错误列表
 * @property {Array<{ code: number; message: string }>} messages - 消息列表
 * @property {T} result - 结果
 */
export interface CloudflareResponse<T = unknown> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

/**
 * Cloudflare 命名空间
 * @property {string} id - 命名空间 ID
 * @property {string} title - 命名空间名称
 * @property {boolean} supports_url_encoding - 是否支持 URL 编码，可选。支持 URL 编码
 */
export interface CloudflareNamespace {
  id: string;
  title: string;
  supports_url_encoding?: boolean;
}

/**
 * Cloudflare 键
 * @property {string} name - 键
 * @property {number} expiration - 过期时间，可选。expiration 为 Unix 时间戳
 * @property {Record<string, unknown>} metadata - 元数据，可选。metadata 为键值对
 */
export interface CloudflareKey {
  name: string;
  expiration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Cloudflare 键值对
 * @property {string} key - 键
 * @property {string | null} value - 值，可选。value 可以为空字符串或 null
 */
export interface CloudflareKeyValue {
  key: string;
  value: string | null;
}

/**
 * Zod 模式验证 --- object 类型。
 * @property {string} name - 存储实例名称，必选。name 长度为 1-64 个字符
 */
export const CreateStoreSchema = z.object({
  name: z.string().min(1).max(64),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string} name - 存储实例名称，必选。name 长度至少 1 个字符
 */
export const DeleteStoreSchema = z.object({
  name: z.string().min(1),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string} name - 存储实例名称，可选。name 长度至少 1 个字符
 */
export const GetStoreSchema = z.object({
  name: z.string().min(1).optional(),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string} prefix - 前缀，可选。prefix 长度至少 1 个字符
 * @property {number} limit - 限制，可选。limit 范围为 1-1000
 * @property {string} cursor - 游标，可选。cursor 长度至少 1 个字符
 */
export const GetKeysSchema = z.object({
  prefix: z.string().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  cursor: z.string().optional(),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string[]} keys - 键列表，必选。keys 长度至少 1 个，最多 100 个
 */
export const GetValuesSchema = z.object({
  keys: z.array(z.string()).min(1).max(100),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string[]} keys - 键列表，必选。keys 长度至少 1 个，最多 10000 个
 */
export const DeleteKeysSchema = z.object({
  keys: z.array(z.string()).min(1).max(10000),
});

/**
 * Zod 模式验证 --- object 类型。
 * @property {string[]} keys - 键列表，必选。keys 长度至少 1 个，最多 10000 个
 * @property {string[]} values - 值列表，可选。values 长度至少 1 个，最多 10000 个
 */
export const PutKeysSchema = z.object({
  keys: z.array(z.string()).min(1).max(10000),
  values: z.array(z.string().nullable()).optional(),
});

/**
 * API 响应类型 --- 存储实例列表。
 * @property {Array<{ id: string; title: string }>} stores - 存储实例列表
 */
export interface StoreListResponse {
  stores: Array<{ id: string; title: string }>;
}

/**
 * API 响应类型 --- 创建存储实例。
 * @property {boolean} success - 是否成功
 * @property {string} id - 存储实例 ID
 */
export interface StoreCreateResponse {
  success: boolean;
  id: string;
}

/**
 * API 响应类型 --- 删除存储实例。
 * @property {boolean} success - 是否成功
 */
export interface StoreDeleteResponse {
  success: boolean;
}

/**
 * API 响应类型 --- 获取键列表。
 * @property {string[]} keys - 键列表
 * @property {string} cursor - 游标，可选
 */
export interface KeysListResponse {
  keys: string[];
  cursor?: string;
}

/**
 * API 响应类型 --- 获取值列表。
 * @property {Array<{ key: string; value: string | null }>} values - 值列表
 */
export interface ValuesGetResponse {
  values: Array<{ key: string; value: string | null }>;
}

/**
 * API 响应类型 --- 删除键列表。
 * @property {string[]} deleted - 删除的键列表
 */
export interface KeysDeleteResponse {
  deleted: string[];
}

/**
 * API 响应类型 --- 创建键列表。
 * @property {string[]} created - 创建的键列表
 */
export interface KeysCreateResponse {
  created: string[];
}

