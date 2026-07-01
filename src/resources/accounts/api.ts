import type { UnifyPortClient } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询当前 workspace 下的账号列表。
 */
export function listAccounts(client: UnifyPortClient): Promise<unknown> {
  return client.request({
    method: "GET",
    path: "/v1/accounts"
  });
}

/**
 * 创建一个渠道账号。
 */
export function createAccount(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/accounts",
    body
  });
}

/**
 * 查询单个账号详情。
 */
export function getAccount(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id)
  });
}

/**
 * 更新单个账号。
 */
export function updateAccount(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "PATCH",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id),
    body
  });
}

/**
 * 删除单个账号。
 */
export function deleteAccount(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "DELETE",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id)
  });
}
