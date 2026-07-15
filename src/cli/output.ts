import * as qrcodeTerminal from "qrcode-terminal";
import {
  createUnifyPortClient,
  type UnifyPortClient,
  type UnifyPortClientConfig,
  type UnifyPortMethod,
  type UnifyPortQuery,
  type UnifyPortRequest
} from "../core/unifyport-client.js";

export type CliWrite = (message: string) => void;
export type CliQrCodeRenderer = (value: string) => string;

type JsonObject = Record<string, unknown>;

export interface CliRequestRecorder {
  client: UnifyPortClient;
  getRequest(): UnifyPortRequest;
  getRequests(): readonly UnifyPortRequest[];
}

/**
 * 从 SDK Request 提取 CLI 可以安全展示的请求信息。
 *
 * 认证 header 不进入记录结果，避免对外 demo 在控制台暴露 API Key。
 */
async function createRecordedRequest(request: Request): Promise<UnifyPortRequest> {
  const url = new URL(request.url);
  const query: UnifyPortQuery = {};

  for (const [key, value] of url.searchParams) {
    query[key] = value;
  }

  const recordedRequest: UnifyPortRequest = {
    method: request.method as UnifyPortMethod,
    path: url.pathname
  };

  if (url.searchParams.size > 0) {
    recordedRequest.query = query;
  }

  if (request.body !== null) {
    const bodyText = await request.clone().text();

    if (bodyText.length > 0) {
      recordedRequest.body = JSON.parse(bodyText) as unknown;
    }
  }

  return recordedRequest;
}

/**
 * 创建 CLI 使用的 SDK client，并记录 SDK 实际发出的请求。
 *
 * 记录发生在 SDK credential 注入之后，但只提取 URL、method 和 body，
 * 因此既能反映真实请求，也不会保留认证 header。
 */
export function createCliRequestRecorder(config: UnifyPortClientConfig): CliRequestRecorder {
  const requests: UnifyPortRequest[] = [];
  const client = createUnifyPortClient({
    ...config,
    async fetch(request) {
      requests.push(await createRecordedRequest(request));
      return await config.fetch(request);
    }
  });

  return {
    client,
    getRequest() {
      return requests[requests.length - 1] as UnifyPortRequest;
    },
    getRequests() {
      return requests;
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
 * 只处理普通 JSON 对象，避免数组或 null 被当作响应 envelope 读取。
 */
function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object") {
    return false;
  }

  if (value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  return true;
}

/**
 * 只识别 WhatsApp QR 授权链接，避免普通验证码 code 被误渲染成二维码。
 */
export function getCliQrCodeValue(responseBody: unknown): string {
  if (isJsonObject(responseBody) === false) {
    return "";
  }

  const data = responseBody.data;

  if (isJsonObject(data) === false) {
    return "";
  }

  const code = data.code;

  if (typeof code !== "string") {
    return "";
  }

  if (code.startsWith("https://wa.me/") === false) {
    return "";
  }

  return code;
}

/**
 * 使用 terminal QR 渲染，便于客户演示时直接在控制台扫码。
 */
export function renderCliQrCode(value: string): string {
  let rendered = "";

  qrcodeTerminal.generate(
    value,
    {
      small: true
    },
    (qrCode) => {
      rendered = qrCode;
    }
  );

  return rendered;
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
  responseBody: unknown,
  renderQrCode: CliQrCodeRenderer = renderCliQrCode
): void {
  write("========== Request ==========");
  write(formatCliRequest(request));
  write("Query:");
  write(formatCliRequestQuery(request));
  write("Body:");
  write(formatCliRequestBody(request));
  write("========== Response ==========");
  write(formatCliValue(responseBody));

  const qrCodeValue = getCliQrCodeValue(responseBody);

  if (qrCodeValue.length > 0) {
    write("========== QR Code ==========");
    write(renderQrCode(qrCodeValue));
    write("请使用 WhatsApp 扫描上方二维码。");
    write(`QR code link: ${qrCodeValue}`);
  }
}

/**
 * 在控制台先输出请求接口，再输出接口响应内容。
 */
export function printCliResponse(request: UnifyPortRequest, responseBody: unknown): void {
  writeCliResponse(console.log, request, responseBody);
}
