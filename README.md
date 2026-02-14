# Cloudflare KV API 

基于 Hono 构建的 Cloudflare KV 存储接口封装。


## 技术栈

- **运行时**: Bun
- **框架**: Hono (轻量级、高性能的 Web 框架)
- **验证**: Zod (TypeScript-first 的 schema 验证)
- **文档**: Swagger UI + OpenAPI 3.0

## 特性

✅ RESTful API 设计
✅ 完整的 TypeScript 类型支持
✅ 请求参数验证（使用 Zod）
✅ 批量操作支持
✅ 自动生成的 API 文档
✅ CORS 支持
✅ 请求日志
✅ 错误处理


## 快速开始

```bash
git clone https://github.com/shyshi/cf-kv.git
cd cf-kv
```

1. 环境配置

创建 `.env` 文件：

```bash
cp .env.example .env
```

配置以下环境变量：

```env
# Cloudflare 帐户 ID
# 在 https://dash.cloudflare.com -> 概述 -> 右侧边栏找到您的帐户 ID
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Cloudflare API 令牌
# 在 https://dash.cloudflare.com/profile/api-tokens 创建 API 令牌
# 所需权限：Workers KV Storage Edit（读/写）
CLOUDFLARE_API_TOKEN=your_api_token_here

# 服务器端口（默认：9527）
PORT=9527

# 最大请求正文大小（以字节为单位）（默认值：10MB）
MAX_BODY_SIZE=10485760

```

2. 安装依赖

```bash
bun install
```

3. 启动

开发模式（支持热重载）：
```bash
bun run dev
```

访问 http://localhost:9527/docs 查看文档。

```
🚀 服务运行在 http://localhost:9527
📚 API 文档请查看 http://localhost:9527/docs
Started development server: http://localhost:9527
```




## 项目结构

```
cf-kv/
├── src/
│   ├── index.ts           # 主入口
│   ├── server.ts          # Bun 服务器
│   ├── types.ts          # TypeScript 类型定义
│   ├── openapi.ts        # OpenAPI 规范
│   ├── middleware/
│   │   └── auth.ts      # Cloudflare 认证中间件
│   └── routes/
│       ├── stores.ts     # 存储实例路由
│       └── kv.ts         # KV 键值对路由
├── .env.example
└── package.json
```




## API 端点

### 存储实例 `/stores`

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/stores` | 获取实例列表 |
| GET | `/stores?name=xxx` | 获取指定实例 |
| POST | `/stores` | 创建实例 |
| DELETE | `/stores` | 删除实例 |

#### 获取实例列表
```bash
curl http://localhost:9527/stores
# 返回: { "stores": [{ "id": "xxx", "title": "my-store" }] }
```

#### 创建实例
```bash
curl -X POST http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
# 返回: { "success": true, "id": "xxx" }
```

#### 删除实例
```bash
curl -X DELETE http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
# 返回: { "success": true }
```

### 键值对操作 `/:name/kv`

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/:name/kv` | 获取所有 key |
| POST | `/:name/kv` | 获取指定 key 的 value |
| DELETE | `/:name/kv` | 删除指定 key-value |
| PUT | `/:name/kv` | 新增 key-value |

#### 获取所有 keys
```bash
curl http://localhost:9527/my-store/kv
# 返回: { "keys": ["key1", "key2"] }
```

#### 获取指定 values
```bash
curl -X POST http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"]}'
# 返回: { "values": [{"key": "key1", "value": "value1"}, {"key": "key2", "value": null}] }
```

#### 删除 keys
```bash
curl -X DELETE http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"]}'
# 返回: { "deleted": ["key1", "key2"] }
```

#### 新增 keys
```bash
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"], "values": ["value1", "value2"]}'
# 返回: { "created": ["key1", "key2"] }

# values 可以有空元素或不传
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"], "values": ["value1", null]}'
```


## API 文档

启动服务器后，访问 http://localhost:9527/docs 查看 Swagger UI 文档。

此处查看 [API 使用示例](EXAMPLES.md)。

## 数据类型说明

- **name** (实例名): string 类型
- **key**: string 类型，必选。key 创建后不能修改，只能删除或创建
- **value**: string 类型，可选

```
name
    key - value 
    key - value
    ... 
name
    key - value 
    key - value
    ... 
...

```


## 注意事项

1. **key 不可更新**：key 创建后不能修改，只能删除后重新创建
2. **value 可选**：创建 key 时 value 可以为空字符串或 null
4. **认证信息**：所有 API 请求都需要配置正确的 Cloudflare 认证信息

## 参考

- [Cloudflare KV API 文档](https://developers.cloudflare.com/api/resources/kv/)
- [Hono 文档](https://hono.dev/)
- [Zod 文档](https://zod.dev/)

