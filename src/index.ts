import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { swaggerUI } from '@hono/swagger-ui';
import { cloudflareAuth } from './middleware/auth';
import stores from './routes/stores';
import kv from './routes/kv';
import type { Variables } from './types';
import { openAPISpec } from './openapi';

const app = new Hono<{ Variables: Variables }>();

// 中间件
app.use('*', logger());
app.use('*', cors());

// OpenAPI 文档路由（不需要认证）
app.get('/openapi.json', (c) => c.json(openAPISpec));
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// 健康检查
app.get('/', (c) => {
  
  return c.json({
    name: 'Cloudflare KV API',
    version: '0.0.1',
    status: 'running',
    docs: c.req.url+'docs',
  });
});

// 需要认证的路由
app.use('*', cloudflareAuth);

// 路由
app.route('/stores', stores);
app.route('/', kv);

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message }, 500);
});

export default app;

