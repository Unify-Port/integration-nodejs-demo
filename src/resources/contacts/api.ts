import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

import type { UnifyPortQuery } from "../../core/unifyport-client.js";

/**
 * 查询账号联系人列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listContacts(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listContacts({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 查询单个联系人详情。
 */
export function getContact(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .getContact({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 拉黑联系人。
 */
export function blockContact(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .blockContact({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 取消拉黑联系人。
 */
export function unblockContact(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .unblockContact({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 查询联系人黑名单。
 */
export function listBlocklist(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .listContactBlocklist({ params: { path: { account_id } } })
    .then((result) => result.data);
}

/**
 * 设置联系人备注。
 */
export function setContactNote(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .setContactNote({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}
