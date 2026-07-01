import type { UnifyPortClient, UnifyPortQuery } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询账号联系人列表。
 */
export function listContacts(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/contacts", "account_id", account_id),
    query
  });
}

/**
 * 查询单个联系人详情。
 */
export function getContact(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/contacts/info", "account_id", account_id),
    query
  });
}

/**
 * 拉黑联系人。
 */
export function blockContact(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/contacts/block",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 取消拉黑联系人。
 */
export function unblockContact(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/contacts/unblock",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 查询联系人黑名单。
 */
export function listBlocklist(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/contacts/blocklist",
      "account_id",
      account_id
    )
  });
}

/**
 * 设置联系人备注。
 */
export function setContactNote(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/contacts/note", "account_id", account_id),
    body
  });
}
