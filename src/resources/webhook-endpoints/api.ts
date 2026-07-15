import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询 webhook endpoint 列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listWebhookEndpoints(client: UnifyPortDeviceClient): Promise<unknown> {
  return client.listWebhookEndpoints().then((result) => result.data);
}

/**
 * 创建 webhook endpoint。
 */
export function createWebhookEndpoint(
  client: UnifyPortDeviceClient,
  body: unknown
): Promise<unknown> {
  return client.createWebhookEndpoint({ body: body as never }).then((result) => result.data);
}

/**
 * 查询单个 webhook endpoint。
 */
export function getWebhookEndpoint(
  client: UnifyPortDeviceClient,
  endpoint_id: string
): Promise<unknown> {
  return client
    .getWebhookEndpoint({ params: { path: { endpoint_id } } })
    .then((result) => result.data);
}

/**
 * 更新 webhook endpoint。
 */
export function updateWebhookEndpoint(
  client: UnifyPortDeviceClient,
  endpoint_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateWebhookEndpoint({ params: { path: { endpoint_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 停用 webhook endpoint。
 */
export function deactivateWebhookEndpoint(
  client: UnifyPortDeviceClient,
  endpoint_id: string
): Promise<unknown> {
  return client
    .deactivateWebhookEndpoint({ params: { path: { endpoint_id } } })
    .then((result) => result.data);
}

/**
 * 删除 webhook endpoint。
 */
export function deleteWebhookEndpoint(
  client: UnifyPortDeviceClient,
  endpoint_id: string
): Promise<unknown> {
  return client
    .deleteWebhookEndpoint({ params: { path: { endpoint_id } } })
    .then((result) => result.data);
}
