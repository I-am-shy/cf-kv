# API 使用示例

## 前置准备

1. 配置 `.env` 文件中的 Cloudflare 认证信息
2. 启动服务器：`bun run dev`

## 存储实例管理

### 1. 创建存储实例

```bash
curl -X POST http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
```

响应：
```json
{
  "success": true,
  "id": "abc123..."
}
```

### 2. 获取所有存储实例

```bash
curl http://localhost:9527/stores
```

响应：
```json
{
  "stores": [
    {
      "id": "abc123...",
      "title": "my-store"
    }
  ]
}
```

### 3. 获取指定存储实例

```bash
curl "http://localhost:9527/stores?name=my-store"
```

### 4. 删除存储实例

```bash
curl -X DELETE http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
```

响应：
```json
{
  "success": true
}
```

## 键值对操作

### 1. 获取所有 keys

```bash
curl http://localhost:9527/my-store/kv
```

响应：
```json
{
  "keys": ["key1", "key2", "key3"]
}
```

支持分页和前缀过滤：
```bash
curl "http://localhost:9527/my-store/kv?prefix=user&limit=10"
```

### 2. 批量创建 key-value

```bash
# 创建带值的 keys
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["key1", "key2", "key3"],
    "values": ["value1", "value2", "value3"]
  }'
```

```bash
# 创建空值的 keys
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["key4", "key5"],
    "values": ["", null]
  }'
```

响应：
```json
{
  "created": ["key1", "key2", "key3"]
}
```

### 3. 批量获取 values

```bash
curl -X POST http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["key1", "key2", "key3"]
  }'
```

响应：
```json
{
  "values": [
    { "key": "key1", "value": "value1" },
    { "key": "key2", "value": "value2" },
    { "key": "key3", "value": null }
  ]
}
```

### 4. 批量删除 keys

```bash
curl -X DELETE http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["key1", "key2"]
  }'
```

响应：
```json
{
  "deleted": ["key1", "key2"]
}
```

## 完整工作流示例

```bash
# 1. 创建存储实例
curl -X POST http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "user-data"}'

# 2. 添加用户数据
curl -X PUT http://localhost:9527/user-data/kv \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["user:1", "user:2", "user:3"],
    "values": ["Alice", "Bob", "Charlie"]
  }'

# 3. 查看所有 keys
curl http://localhost:9527/user-data/kv

# 4. 获取特定用户数据
curl -X POST http://localhost:9527/user-data/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["user:1", "user:2"]}'

# 5. 删除用户
curl -X DELETE http://localhost:9527/user-data/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["user:3"]}'

# 6. 清理：删除存储实例
curl -X DELETE http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "user-data"}'
```

## 错误处理

所有错误响应格式：
```json
{
  "error": "错误信息"
}
```

常见错误：
- `404`: 存储实例或 key 不存在
- `400`: 请求参数验证失败
- `500`: Cloudflare API 错误或服务器内部错误

