
export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Cloudflare KV API',
    version: '0.0.1',
    description: '基于 Hono 构建的 Cloudflare KV 存储接口封装 <br />'
      +'接口文档请查看： [Cloudflare KV API](https://github.com/I-am-shy/cf-kv)  <br />' 
      +( process.env.CLOUDFLARE_ACCOUNT_ID ?
      `[Cloudflare KV 面板](https://dash.cloudflare.com/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/kv/namespaces)`:
      `[Cloudflare KV 面板](https://dash.cloudflare.com/)`),
  },
  servers: [
    {
      url: 'http://localhost:'+process.env.PORT,
      description: 'Cloudflare KV server',
    },
  ],
  paths: {
    '/stores': {
      get: {
        summary: '获取存储实例列表',
        parameters: [
          {
            name: 'name',
            in: 'query',
            schema: { type: 'string' },
            description: '可选：指定实例名称',
          },
        ],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stores: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: '创建存储实例',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: '删除存储实例',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/{name}/kv': {
      get: {
        summary: '获取所有 keys',
        parameters: [
          {
            name: 'name',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    keys: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: '获取指定 keys 的 values',
        parameters: [
          {
            name: 'name',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  keys: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['keys'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: '成功',
          },
        },
      },
    },
  },
};

