import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询 API Key 列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listApiKeys(client: UnifyPortDeviceClient): Promise<unknown> {
  return client.listApiKeys().then((result) => result.data);
}

/**
 * 创建 API Key。
 */
export function createApiKey(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.createApiKey({ body: body as never }).then((result) => result.data);
}

/**
 * 更新 API Key 状态。
 */
export function updateApiKey(
  client: UnifyPortDeviceClient,
  key_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateApiKeyStatus({ params: { path: { key_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 轮换 API Key。
 */
export function rotateApiKey(
  client: UnifyPortDeviceClient,
  key_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .rotateApiKey({ params: { path: { key_id } }, body: body as never })
    .then((result) => result.data);
}
