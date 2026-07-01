import type { UnifyPortClient } from "../../core/unifyport-client.js";

/**
 * 查询当前 API Key 所属 workspace。
 */
export function getWorkspace(client: UnifyPortClient): Promise<unknown> {
  return client.request({
    method: "GET",
    path: "/v1/workspace"
  });
}

/**
 * 更新当前 workspace。
 */
export function updateWorkspace(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "PATCH",
    path: "/v1/workspace",
    body
  });
}
