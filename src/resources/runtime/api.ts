import type { UnifyPortClient } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 刷新账号 runtime 状态。
 */
export function refreshRuntime(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/runtime/refresh",
      "account_id",
      account_id
    ),
    body: {}
  });
}

/**
 * 启动账号 runtime。
 */
export function startRuntime(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/runtime/start", "account_id", account_id),
    body: {}
  });
}

/**
 * 停止账号 runtime。
 */
export function stopRuntime(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/runtime/stop", "account_id", account_id),
    body: {}
  });
}

/**
 * 重连账号 runtime。
 */
export function reconnectRuntime(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/runtime/reconnect",
      "account_id",
      account_id
    ),
    body: {}
  });
}
