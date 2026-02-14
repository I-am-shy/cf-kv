# Cloudflare KV API

A Cloudflare KV storage API based on Hono.

[中文文档](README.md) | [English Doc](README_EN.md)

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (lightweight, high-performance web framework)
- **Validation**: Zod (TypeScript-first schema validation)
- **Docs**: Swagger UI + OpenAPI 3.0

## Features

✅ RESTful API design  
✅ Complete TypeScript type support  
✅ Request parameter validation (using Zod)  
✅ Batch operations support  
✅ Auto-generated API documentation  
✅ CORS support  
✅ Request logging  
✅ Error handling

## Quick Start

```bash
git clone https://github.com/shyshi/cf-kv.git
cd cf-kv
```

1. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Set the following environment variables:

```env
# Cloudflare Account ID
# Find your Account ID at https://dash.cloudflare.com -> Overview -> right sidebar
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Cloudflare API Token
# Create an API token at https://dash.cloudflare.com/profile/api-tokens
# Required Permission: Workers KV Storage Edit (read/write)
CLOUDFLARE_API_TOKEN=your_api_token_here

# Server port (default: 9527)
PORT=9527

# Max request body size in bytes (default: 10MB)
MAX_BODY_SIZE=10485760

```

2. Install dependencies

```bash
bun install
```

3. Start

Development mode (with hot reload):

```bash
bun run dev
```

Visit http://localhost:9527/docs for documentation.

```
🚀 Server running at http://localhost:9527
📚 API docs: http://localhost:9527/docs
Started development server: http://localhost:9527
```

## Project Structure

```
cf-kv/
├── src/
│   ├── index.ts           # Main entry
│   ├── server.ts          # Bun server
│   ├── types.ts           # TypeScript types
│   ├── openapi.ts         # OpenAPI spec
│   ├── middleware/
│   │   └── auth.ts        # Cloudflare auth middleware
│   └── routes/
│       ├── stores.ts      # Store instance routes
│       └── kv.ts          # KV routes
├── .env.example
└── package.json
```

## API Endpoints

### Stores `/stores`

| Method | Endpoint | Description        |
|--------|----------|-------------------|
| GET    | `/stores`           | Get list of stores      |
| GET    | `/stores?name=xxx`  | Get specific store      |
| POST   | `/stores`           | Create store            |
| DELETE | `/stores`           | Delete store            |

#### Get store list
```bash
curl http://localhost:9527/stores
# Returns: { "stores": [{ "id": "xxx", "title": "my-store" }] }
```

#### Create store
```bash
curl -X POST http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
# Returns: { "success": true, "id": "xxx" }
```

#### Delete store
```bash
curl -X DELETE http://localhost:9527/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "my-store"}'
# Returns: { "success": true }
```

### Key-Value Operations `/:name/kv`

| Method | Endpoint        | Description          |
|--------|----------------|---------------------|
| GET    | `/:name/kv`    | Get all keys        |
| POST   | `/:name/kv`    | Get specified keys' values |
| DELETE | `/:name/kv`    | Delete specified key-value pairs |
| PUT    | `/:name/kv`    | Add key-value pairs |

#### Get all keys
```bash
curl http://localhost:9527/my-store/kv
# Returns: { "keys": ["key1", "key2"] }
```

#### Get specific values
```bash
curl -X POST http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"]}'
# Returns: { "values": [{"key": "key1", "value": "value1"}, {"key": "key2", "value": null}] }
```

#### Delete keys
```bash
curl -X DELETE http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"]}'
# Returns: { "deleted": ["key1", "key2"] }
```

#### Add keys
```bash
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"], "values": ["value1", "value2"]}'
# Returns: { "created": ["key1", "key2"] }

# "values" can have empty elements or be omitted
curl -X PUT http://localhost:9527/my-store/kv \
  -H "Content-Type: application/json" \
  -d '{"keys": ["key1", "key2"], "values": ["value1", null]}'
```

## API Documentation

After starting the server, visit http://localhost:9527/docs to view Swagger UI documentation.

See also [API Usage Examples](EXAMPLES.md).

## Data Type Explanation

- **name** (store name): string
- **key**: string, required. Once created, a key cannot be updated, only deleted or created
- **value**: string, optional

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

## Notes

1. **Keys are immutable**: Once created, a key cannot be updated—only deleted then re-created.
2. **Value is optional**: When creating a key, value can be an empty string or null.
3. **Authentication required**: All API requests must include correct Cloudflare authentication info.

## References

- [Cloudflare KV API Docs](https://developers.cloudflare.com/api/resources/kv/)
- [Hono Docs](https://hono.dev/)
- [Zod Docs](https://zod.dev/)
