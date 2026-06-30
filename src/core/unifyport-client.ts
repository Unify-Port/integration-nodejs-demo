export type UnifyPortMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface UnifyPortClientConfig {
  baseUrl: string;
  apiKey: string;
  fetch: typeof fetch;
}

export interface UnifyPortRequest {
  method: UnifyPortMethod;
  path: string;
  body?: unknown;
}

export interface UnifyPortClient {
  request(request: UnifyPortRequest): Promise<unknown>;
}

/**
 * 创建 UnifyPort REST API 客户端。
 *
 * 这个客户端只封装所有渠道共享的请求规则：Base URL、X-Api-Key 认证头、
 * JSON 请求体序列化。渠道自己的字段必须放在各自目录里构造，避免核心层
 * 混入 WhatsApp、Telegram、LINE 等渠道差异。
 */
export function createUnifyPortClient(config: UnifyPortClientConfig): UnifyPortClient {
  return {
    async request(request: UnifyPortRequest): Promise<unknown> {
      const headers = new Headers();
      headers.set("X-Api-Key", config.apiKey);

      const requestInit: RequestInit = {
        method: request.method,
        headers
      };

      if (request.body !== undefined) {
        headers.set("Content-Type", "application/json");
        requestInit.body = JSON.stringify(request.body);
      }

      const response = await config.fetch(new URL(request.path, config.baseUrl), requestInit);
      const responseBody = await response.json();

      return responseBody;
    }
  };
}
