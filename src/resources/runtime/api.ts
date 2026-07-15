import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 刷新账号 runtime 状态。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function refreshRuntime(
  client: UnifyPortDeviceClient,
  account_id: string
): Promise<unknown> {
  return client
    .refreshAccountRuntime({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 启动账号 runtime。
 */
export function startRuntime(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .startAccountRuntime({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 停止账号 runtime。
 */
export function stopRuntime(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .stopAccountRuntime({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 重连账号 runtime。
 */
export function reconnectRuntime(
  client: UnifyPortDeviceClient,
  account_id: string
): Promise<unknown> {
  return client
    .reconnectAccountRuntime({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}
