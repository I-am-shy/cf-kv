import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateStoreSchema, DeleteStoreSchema, GetStoreSchema, type Variables } from '../types';
import type { CloudflareClient } from '../middleware/auth';

const stores = new Hono<{ Variables: Variables }>();

/**
 * GET /stores - 获取存储实例列表或指定实例
 * @returns {Promise<Response>} JSON 响应，包含存储实例列表
 */
stores.get('/', zValidator('query', GetStoreSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const { name } = c.req.valid('query');

  try {
    const response = await cf.listNamespaces();
    
    if (name) {
      // 查找指定名称的实例
      const namespace = response.result.find((ns: any) => ns.title === name);
      if (!namespace) {
        return c.json({ error: 'Store not found' }, 404);
      }
      return c.json({ stores: [{ id: namespace.id, title: namespace.title }] });
    }

    // 返回所有实例
    const stores = response.result.map((ns: any) => ({
      id: ns.id,
      title: ns.title,
    }));

    return c.json({ stores });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/**
 * POST /stores - 创建存储实例
 * @returns {Promise<Response>} JSON 响应，包含创建结果
 */
stores.post('/', zValidator('json', CreateStoreSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const { name } = c.req.valid('json');

  try {
    // 检查是否已存在同名实例
    const listResponse = await cf.listNamespaces();
    const existing = listResponse.result.find((ns: any) => ns.title === name);
    
    if (existing) {
      return c.json({ error: 'Store with this name already exists' }, 400);
    }

    // 创建新实例
    const response = await cf.createNamespace(name);
    
    return c.json({
      success: true,
      id: response.result.id,
    });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/**
 * DELETE /stores - 删除存储实例
 * @returns {Promise<Response>} JSON 响应，包含删除结果
 */
stores.delete('/', zValidator('json', DeleteStoreSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const { name } = c.req.valid('json');

  try {
    // 查找实例 ID
    const listResponse = await cf.listNamespaces();
    const namespace = listResponse.result.find((ns: any) => ns.title === name);
    
    if (!namespace) {
      return c.json({ error: 'Store not found' }, 404);
    }

    // 删除实例
    await cf.deleteNamespace(namespace.id);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default stores;

