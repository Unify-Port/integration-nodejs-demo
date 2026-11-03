export type UnifyPortMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type UnifyPortQuery = Record<string, string | number | boolean>;

export interface UnifyPortClientConfig {
  baseUrl: string;
  apiKey: string;
  fetch: typeof fetch;
}

export interface UnifyPortRequest {
  method: UnifyPortMethod;
  path: string;
  query?: UnifyPortQuery;
  body?: unknown;
  headers?: Record<string, string>;
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
      if (request.headers !== undefined) {
        for (const [name, value] of Object.entries(request.headers)) {
          /** 只转发契约幂等与诊断头，调用输入不能覆盖认证或控制传输目标。 */
          if (!["idempotency-key", "x-request-id"].includes(name.toLowerCase())) {
            throw new Error("Unsupported request header");
          }
          headers.set(name, value);
        }
      }
      headers.set("X-Api-Key", config.apiKey);
      const url = new URL(request.path, config.baseUrl);

      const requestInit: RequestInit = {
        method: request.method,
        headers
      };

      if (request.query !== undefined) {
        for (const [key, value] of Object.entries(request.query)) {
          url.searchParams.set(key, String(value));
        }
      }

      if (request.body !== undefined) {
        headers.set("Content-Type", "application/json");
        requestInit.body = JSON.stringify(request.body);
      }

      const response = await config.fetch(url, requestInit);
      /** 204 是公开删除接口的旧成功契约，没有 JSON 正文。202 的操作结果继续原样交给调用方。 */
      if (response.status === 204) {
        return null;
      }
      const responseBody = await response.json();

      return responseBody;
    }
  };
}
