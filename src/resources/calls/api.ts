import type { UnifyPortClient, UnifyPortQuery } from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 准备主动通话；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function createCall(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/calls",
    body
  });
}

/**
 * 查询账号当前活动通话；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function getActiveCall(client: UnifyPortClient, query: UnifyPortQuery): Promise<unknown> {
  return client.request({
    method: "GET",
    path: "/v1/calls/active",
    query
  });
}

/**
 * 挂断指定通话；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function hangupCall(
  client: UnifyPortClient,
  call_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: replacePathParameter("/v1/calls/{call_id}/hangup", "call_id", call_id),
    body
  });
}
