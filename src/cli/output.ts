import type { UnifyPortClient, UnifyPortRequest } from "../core/unifyport-client.js";

export type CliWrite = (message: string) => void;

export interface CliRequestRecorder {
  client: UnifyPortClient;
  getRequest(): UnifyPortRequest;
}

/**
 * 包装 CLI 使用的 client，并记录本次实际发出的请求。
 */
export function createCliRequestRecorder(client: UnifyPortClient): CliRequestRecorder {
  let recordedRequest: UnifyPortRequest;

  return {
    client: {
      async request(request) {
        recordedRequest = request;
        return client.request(request);
      }
    },
    getRequest() {
      return recordedRequest;
    }
  };
}

/**
 * 将请求格式化为控制台中的接口行。
 */
export function formatCliRequest(request: UnifyPortRequest): string {
  let requestLine = `${request.method} ${request.path}`;

  if (request.query !== undefined) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(request.query)) {
      query.set(key, String(value));
    }

    const queryText = query.toString();

    if (queryText.length > 0) {
      requestLine = `${requestLine}?${queryText}`;
    }
  }

  return requestLine;
}

/**
 * 将控制台参数内容格式化为 JSON 文本。
 */
function formatCliValue(value: unknown): string {
  const text = JSON.stringify(value, null, 2);

  if (text === undefined) {
    return "无";
  }

  return text;
}

/**
 * 格式化请求 query 参数。
 */
export function formatCliRequestQuery(request: UnifyPortRequest): string {
  if (request.query === undefined) {
    return "无";
  }

  return formatCliValue(request.query);
}

/**
 * 格式化请求 body 参数。
 */
export function formatCliRequestBody(request: UnifyPortRequest): string {
  if (request.body === undefined) {
    return "无";
  }

  return formatCliValue(request.body);
}

/**
 * 通过指定写入函数先输出请求接口，再输出接口响应内容。
 */
export function writeCliResponse(
  write: CliWrite,
  request: UnifyPortRequest,
  responseBody: unknown
): void {
  write("========== Request ==========");
  write(formatCliRequest(request));
  write("Query:");
  write(formatCliRequestQuery(request));
  write("Body:");
  write(formatCliRequestBody(request));
  write("========== Response ==========");
  write(formatCliValue(responseBody));
}

/**
 * 在控制台先输出请求接口，再输出接口响应内容。
 */
export function printCliResponse(request: UnifyPortRequest, responseBody: unknown): void {
  writeCliResponse(console.log, request, responseBody);
}
