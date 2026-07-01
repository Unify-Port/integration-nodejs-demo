import type { UnifyPortClient } from "../../core/unifyport-client.js";

/**
 * 发送文本消息。
 */
export function sendTextMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body
  });
}

/**
 * 发送媒体消息。
 */
export function sendMediaMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body
  });
}

/**
 * 发送联系人卡片消息。
 */
export function sendContactMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body
  });
}

/**
 * 发送引用回复消息。
 */
export function sendReplyMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body
  });
}

/**
 * 发送群成员 mention 消息。
 */
export function sendMentionMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body
  });
}

/**
 * 置顶或取消置顶消息。
 */
export function pinMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages/pin",
    body
  });
}

/**
 * 撤回消息。
 */
export function revokeMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages/revoke",
    body
  });
}

/**
 * 设置消息 reaction。
 */
export function reactMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages/reaction",
    body
  });
}

/**
 * 编辑消息文本内容。
 */
export function editMessage(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages/edit",
    body
  });
}
