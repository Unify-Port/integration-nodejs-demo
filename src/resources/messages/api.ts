import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 发送文本消息。
 * SDK 接入期间保留各演示函数，避免不同消息场景失去独立入口。
 */
export function sendTextMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.sendMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 发送媒体消息。
 */
export function sendMediaMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.sendMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 发送联系人卡片消息。
 */
export function sendContactMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.sendMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 发送引用回复消息。
 */
export function sendReplyMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.sendMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 发送群成员 mention 消息。
 */
export function sendMentionMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.sendMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 置顶或取消置顶消息。
 */
export function pinMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.pinMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 撤回消息。
 */
export function revokeMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.revokeMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 设置消息 reaction。
 */
export function reactMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.reactMessage({ body: body as never }).then((result) => result.data);
}

/**
 * 编辑消息文本内容。
 */
export function editMessage(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.editMessage({ body: body as never }).then((result) => result.data);
}
