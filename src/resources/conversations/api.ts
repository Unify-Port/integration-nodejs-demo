import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

import type { UnifyPortQuery } from "../../core/unifyport-client.js";

/**
 * 查询账号会话列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listConversations(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listConversations({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 查询单个会话详情。
 */
export function getConversation(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .getConversation({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 查询群会话成员列表。
 */
export function listConversationMembers(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listConversationMembers({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 标记会话已读。
 */
export function markConversationRead(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .markConversationRead({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 标记会话未读。
 */
export function markConversationUnread(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .markConversationUnread({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 静音会话。
 */
export function muteConversation(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .muteConversation({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 取消静音会话。
 */
export function unmuteConversation(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .unmuteConversation({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 置顶会话。
 */
export function pinConversation(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .pinConversation({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 取消置顶会话。
 */
export function unpinConversation(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .unpinConversation({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 查询会话标签列表。
 */
export function listConversationLabels(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listConversationLabels({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 创建或更新会话标签。
 */
export function upsertConversationLabel(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .upsertConversationLabel({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 删除会话标签。
 */
export function deleteConversationLabel(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .deleteConversationLabel({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 为会话执行标签成员操作。
 */
export function setConversationLabelMembers(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .setConversationLabelMembers({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}
