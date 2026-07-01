import type { UnifyPortClient } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询账号认证状态。
 */
export function getAccountAuth(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/auth", "account_id", account_id)
  });
}

/**
 * 启动验证码认证流程。
 */
export function startCodeAuth(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/start", "account_id", account_id),
    body: {}
  });
}

/**
 * 提交验证码。
 */
export function submitAuthCode(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/code", "account_id", account_id),
    body
  });
}

/**
 * 启动二维码认证流程。
 */
export function startQrAuth(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/qr/start", "account_id", account_id),
    body: {}
  });
}

/**
 * 检查二维码认证状态。
 */
export function checkQrAuth(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/qr/check", "account_id", account_id),
    body: {}
  });
}

/**
 * 提交二次认证密码。
 */
export function submitAuthPassword(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/password", "account_id", account_id),
    body
  });
}

/**
 * 导入认证 session。
 */
export function importAuthSession(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/session", "account_id", account_id),
    body
  });
}

/**
 * 取消当前认证流程。
 */
export function cancelAuth(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/auth/cancel", "account_id", account_id),
    body: {}
  });
}
