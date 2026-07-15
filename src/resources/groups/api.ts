import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

import type { UnifyPortQuery } from "../../core/unifyport-client.js";

/**
 * 查询账号群列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listGroups(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listGroups({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 查询单个群详情。
 */
export function getGroup(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .getGroup({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 创建群。
 */
export function createGroup(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .createGroup({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 退出群。
 */
export function leaveGroup(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .leaveGroup({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 更新群成员。
 */
export function updateGroupMembers(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateGroupMembers({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 更新群信息。
 */
export function updateGroupInfo(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateGroupInfo({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 查询入群申请列表。
 */
export function listGroupJoinRequests(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .listGroupJoinRequests({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}

/**
 * 审批或拒绝入群申请。
 */
export function updateGroupJoinRequests(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateGroupJoinRequests({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 设置入群审批模式。
 */
export function setGroupJoinApprovalMode(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .setGroupJoinApprovalMode({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 查询群邀请链接。
 */
export function getGroupInviteCode(
  client: UnifyPortDeviceClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client
    .getGroupInviteCode({ params: { path: { account_id }, query: query as never } })
    .then((result) => result.data);
}
