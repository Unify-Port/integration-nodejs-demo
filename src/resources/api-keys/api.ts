import type { UnifyPortClient } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询 API Key 列表。
 */
export function listApiKeys(client: UnifyPortClient): Promise<unknown> {
  return client.request({
    method: "GET",
    path: "/v1/api-keys"
  });
}

/**
 * 创建 API Key。
 */
export function createApiKey(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/api-keys",
    body
  });
}

/**
 * 更新 API Key 状态。
 */
export function updateApiKey(
  client: UnifyPortClient,
  key_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "PATCH",
    path: replacePathParameter("/v1/api-keys/{key_id}", "key_id", key_id),
    body
  });
}

/**
 * 轮换 API Key。
 */
export function rotateApiKey(
  client: UnifyPortClient,
  key_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/api-keys/{key_id}/rotate", "key_id", key_id),
    body
  });
}
