import type { UnifyPortClient } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询 provider 可用区域。
 */
export function listProviderRegions(client: UnifyPortClient, provider: string): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/providers/{provider}/regions", "provider", provider)
  });
}
