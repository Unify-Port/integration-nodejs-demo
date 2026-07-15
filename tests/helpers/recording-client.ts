import { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

import type {
  UnifyPortClient,
  UnifyPortMethod,
  UnifyPortQuery,
  UnifyPortRequest
} from "../../src/core/unifyport-client.js";

export interface RecordingClient {
  client: UnifyPortClient;
  requests: UnifyPortRequest[];
}

function parseMethod(method: string): UnifyPortMethod {
  if (method === "GET" || method === "POST" || method === "PATCH" || method === "DELETE") {
    return method;
  }
  throw new Error(`Unsupported test method: ${method}`);
}

function parseQuery(url: URL): UnifyPortQuery | undefined {
  if (url.searchParams.size === 0) return undefined;

  const query: UnifyPortQuery = {};
  for (const [key, value] of url.searchParams) {
    /** SDK 已把 query 写入 URL；测试按契约恢复数值字段以保持既有断言语义。 */
    query[key] = key === "limit" ? Number(value) : value;
  }
  return query;
}

export function createRecordingClient(): RecordingClient {
  const requests: UnifyPortRequest[] = [];
  const client = new UnifyPortDeviceClient({
    baseUrl: "https://api.example.test",
    apiKey: "test-api-key",
    retry: {
      maxRetries: 0
    },
    async fetch(request) {
      const url = new URL(request.url);
      const bodyText = await request.text();
      const recorded: UnifyPortRequest = {
        method: parseMethod(request.method),
        path: url.pathname
      };
      const query = parseQuery(url);
      if (query !== undefined) recorded.query = query;
      if (bodyText !== "") recorded.body = JSON.parse(bodyText) as unknown;
      requests.push(recorded);

      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
  });

  return {
    client,
    requests
  };
}
