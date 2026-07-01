import type { UnifyPortClient, UnifyPortQuery } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询账号群列表。
 */
export function listGroups(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/groups", "account_id", account_id),
    query
  });
}

/**
 * 查询单个群详情。
 */
export function getGroup(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/groups/info", "account_id", account_id),
    query
  });
}

/**
 * 创建群。
 */
export function createGroup(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/groups/create", "account_id", account_id),
    body
  });
}

/**
 * 退出群。
 */
export function leaveGroup(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/groups/leave", "account_id", account_id),
    body
  });
}

/**
 * 更新群成员。
 */
export function updateGroupMembers(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/members",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 更新群信息。
 */
export function updateGroupInfo(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/update-info",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 查询入群申请列表。
 */
export function listGroupJoinRequests(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/join-requests",
      "account_id",
      account_id
    ),
    query
  });
}

/**
 * 审批或拒绝入群申请。
 */
export function updateGroupJoinRequests(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/join-requests/update",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 设置入群审批模式。
 */
export function setGroupJoinApprovalMode(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/join-approval-mode",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 查询群邀请链接。
 */
export function getGroupInviteCode(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/groups/invite-code",
      "account_id",
      account_id
    ),
    query
  });
}
