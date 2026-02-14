import { Context, Next } from 'hono';

/**
 * Cloudflare API 客户端
 * @param {string} accountId - Cloudflare 账户 ID
 * @param {string} apiToken - Cloudflare API 令牌
 */
export class CloudflareClient {
  private accountId: string;
  private apiToken: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送请求到 Cloudflare API
   */
  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      const error = data.errors?.[0] || { message: 'Unknown error' };
      throw new Error(`Cloudflare API Error: ${error.message}`);
    }

    return data as T;
  }

  /**
   * 获取命名空间列表
   */
  async listNamespaces() {
    return this.request<any>(
      'GET',
      `/accounts/${this.accountId}/storage/kv/namespaces`
    );
  }

  /**
   * 获取命名空间
   */
  async getNamespace(namespaceId: string) {
    return this.request<any>(
      'GET',
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}`
    );
  }

  /**
   * 创建命名空间
   */
  async createNamespace(title: string) {
    return this.request<any>(
      'POST',
      `/accounts/${this.accountId}/storage/kv/namespaces`,
      { title }
    );
  }

  /**
   * 删除命名空间
   */
  async deleteNamespace(namespaceId: string) {
    return this.request<any>(
      'DELETE',
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}`
    );
  }

  /**
   * 获取键列表
   */
  async listKeys(namespaceId: string, params?: { prefix?: string; limit?: number; cursor?: string }) {
    const query = new URLSearchParams();
    if (params?.prefix) query.set('prefix', params.prefix);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);
    
    const queryString = query.toString();
    const path = `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/keys${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any>('GET', path);
  }

  /**
   * 获取键值
   */
  async getValue(namespaceId: string, key: string) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get value: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * 设置键值
   */
  async putValue(namespaceId: string, key: string, value: string) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'text/plain',
      },
      body: value,
    });

    if (!response.ok) {
      throw new Error(`Failed to put value: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 删除键
   */
  async deleteKey(namespaceId: string, key: string) {
    const url = `${this.baseUrl}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete key: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 批量删除键
   */
  async bulkDelete(namespaceId: string, keys: string[]) {
    return this.request<any>(
      'DELETE',
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/bulk`,
      keys
    );
  }
}

/**
 * Cloudflare 认证中间件
 */
export const cloudflareAuth = async (c: Context, next: Next) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return c.json({ error: '缺少 Cloudflare 凭据' }, 500);
  }

  c.set('cf', new CloudflareClient(accountId, apiToken));
  await next();
};

