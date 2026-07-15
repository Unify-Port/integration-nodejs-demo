import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询 provider 可用区域。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listProviderRegions(
  client: UnifyPortDeviceClient,
  provider: string
): Promise<unknown> {
  return client
    .listProviderRegions({ params: { path: { provider: provider as never } } })
    .then((result) => result.data);
}
