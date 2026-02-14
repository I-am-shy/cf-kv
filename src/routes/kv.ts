import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { GetKeysSchema, GetValuesSchema, DeleteKeysSchema, PutKeysSchema, type Variables } from '../types';
import type { CloudflareClient } from '../middleware/auth';

const kv = new Hono<{ Variables: Variables }>();

/**
 * 获取命名空间 ID 通过名称
 * @param {CloudflareClient} cf - Cloudflare 客户端
 * @param {string} name - 命名空间名称
 * @returns {Promise<string | null>} 命名空间 ID
 */
async function getNamespaceId(cf: CloudflareClient, name: string): Promise<string | null> {
  const response = await cf.listNamespaces();
  const namespace = response.result.find((ns: any) => ns.title === name);
  return namespace ? namespace.id : null;
}

/**
 * GET /:name/kv - 获取所有 keys
 * @returns {Promise<Response>} JSON 响应，包含键列表
 */
kv.get('/:name/kv', zValidator('query', GetKeysSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const name = c.req.param('name');
  const { prefix, limit, cursor } = c.req.valid('query');

  try {
    const namespaceId = await getNamespaceId(cf, name);
    if (!namespaceId) {
      return c.json({ error: 'Store not found' }, 404);
    }

    const response = await cf.listKeys(namespaceId, { prefix, limit, cursor });
    
    const keys = response.result.map((key: any) => key.name);
    const result: any = { keys };
    
    if (response.result_info?.cursor) {
      result.cursor = response.result_info.cursor;
    }

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/**
 * POST /:name/kv - 获取指定 keys 的 values
 * @returns {Promise<Response>} JSON 响应，包含键值列表
 */
kv.post('/:name/kv', zValidator('json', GetValuesSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const name = c.req.param('name');
  const { keys } = c.req.valid('json');

  try {
    const namespaceId = await getNamespaceId(cf, name);
    if (!namespaceId) {
      return c.json({ error: 'Store not found' }, 404);
    }

    // 批量获取 values
    const values = await Promise.all(
      keys.map(async (key) => {
        try {
          const value = await cf.getValue(namespaceId, key);
          return { key, value };
        } catch (error) {
          return { key, value: null };
        }
      })
    );

    return c.json({ values });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/**
 * DELETE /:name/kv - 删除指定 keys
 * @returns {Promise<Response>} JSON 响应，包含删除结果
 */
kv.delete('/:name/kv', zValidator('json', DeleteKeysSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const name = c.req.param('name');
  const { keys } = c.req.valid('json');

  try {
    const namespaceId = await getNamespaceId(cf, name);
    if (!namespaceId) {
      return c.json({ error: 'Store not found' }, 404);
    }

    // 批量删除
    await cf.bulkDelete(namespaceId, keys);

    return c.json({ deleted: keys });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

/**
 * PUT /:name/kv - 新增 key-value 对
 * @returns {Promise<Response>} JSON 响应，包含新增结果
 */
kv.put('/:name/kv', zValidator('json', PutKeysSchema), async (c) => {
  const cf = c.get('cf') as CloudflareClient;
  const name = c.req.param('name');
  const { keys, values } = c.req.valid('json');

  try {
    const namespaceId = await getNamespaceId(cf, name);
    if (!namespaceId) {
      return c.json({ error: 'Store not found' }, 404);
    }

    // 批量写入
    const results = await Promise.all(
      keys.map(async (key, index) => {
        try {
          const value = values?.[index] ?? '';
          if (value !== null) {
            await cf.putValue(namespaceId, key, value);
          } else {
            await cf.putValue(namespaceId, key, '');
          }
          return key;
        } catch (error) {
          console.error(`Failed to put key ${key}:`, error);
          throw error;
        }
      })
    );

    return c.json({ created: results });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default kv;

