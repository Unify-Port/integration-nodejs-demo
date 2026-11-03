import type { UnifyPortClient, UnifyPortQuery } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 列出本账号帖子；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function listPosts(
  client: UnifyPortClient,
  account_id: string,
  query: UnifyPortQuery
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}/posts", "account_id", account_id),
    query
  });
}

/**
 * 获取帖子详情；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function getPost(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/accounts/{account_id}/posts/info", "account_id", account_id),
    body
  });
}

/**
 * 列出帖子的一级评论；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function listPostComments(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/posts/comments/list",
      "account_id",
      account_id
    ),
    body
  });
}

/**
 * 发布一级评论或回复一级评论；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function replyPostComment(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter(
      "/v1/accounts/{account_id}/posts/comments/reply",
      "account_id",
      account_id
    ),
    body
  });
}
