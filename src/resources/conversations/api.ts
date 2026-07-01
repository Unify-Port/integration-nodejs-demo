import type { UnifyPortClient, UnifyPortQuery } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询账号会话列表。
 */
export function listConversations(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/conversations", "account_id", account_id),
    query
  });
}

/**
 * 查询单个会话详情。
 */
export function getConversation(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/info",
      "account_id",
      account_id
    ),
    query
  });
}

/**
 * 查询群会话成员列表。
 */
export function listConversationMembers(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/members",
      "account_id",
      account_id
    ),
    query
  });
}

/**
 * 标记会话已读。
 */
export function markConversationRead(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/read",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 标记会话未读。
 */
export function markConversationUnread(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/unread",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 静音会话。
 */
export function muteConversation(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/mute",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 取消静音会话。
 */
export function unmuteConversation(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/unmute",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 置顶会话。
 */
export function pinConversation(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/pin",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 取消置顶会话。
 */
export function unpinConversation(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/unpin",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 查询会话标签列表。
 */
export function listConversationLabels(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/labels",
      "account_id",
      account_id
    ),
    query
  });
}

/**
 * 创建或更新会话标签。
 */
export function upsertConversationLabel(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/labels/upsert",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 删除会话标签。
 */
export function deleteConversationLabel(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/labels/delete",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 为会话执行标签成员操作。
 */
export function setConversationLabelMembers(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/conversations/labels",
      "account_id",
      account_id
    ),
    body
  });
}
