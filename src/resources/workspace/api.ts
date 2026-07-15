import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询当前 API Key 所属 workspace。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function getWorkspace(client: UnifyPortDeviceClient): Promise<unknown> {
  return client.getWorkspace().then((result) => result.data);
}

/**
 * 更新当前 workspace。
 */
export function updateWorkspace(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.updateWorkspace({ body: body as never }).then((result) => result.data);
}
