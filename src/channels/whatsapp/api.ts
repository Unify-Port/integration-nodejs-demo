import type { UnifyPortClient } from "../../core/unifyport-client.js";
import {
  createWhatsAppCodeAccountPayload,
  createWhatsAppTextMessagePayload,
  type CreateWhatsAppCodeAccountPayloadInput,
  type WhatsAppTextMessagePayloadInput
} from "./payloads.js";

/**
 * 查询 WhatsApp 可用区域。
 *
 * 账号创建前先调用这个接口，客户演示时可以直接展示 supported 与 allocatable
 * 的差异，避免把区域选择逻辑散落到 CLI 或页面代码里。
 */
export function listWhatsAppRegions(client: UnifyPortClient): Promise<unknown> {
  return client.request({
    method: "GET",
    path: "/v1/providers/whatsapp/regions"
  });
}

/**
 * 创建 WhatsApp code 授权账号。
 *
 * 这里只负责 WhatsApp 渠道的账号创建流程，其他渠道后续应放在自己的
 * src/channels/<provider> 目录中，保持每个渠道的字段和流程独立。
 */
export function createWhatsAppCodeAccount(
  client: UnifyPortClient,
  input: CreateWhatsAppCodeAccountPayloadInput
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/accounts",
    body: createWhatsAppCodeAccountPayload(input)
  });
}

/**
 * 启动 WhatsApp 手机号配对授权。
 *
 * 文档说明手机号已在账号创建时写入 provider_data.phone，因此这个请求不传 body。
 */
export function startWhatsAppCodeAuth(
  client: UnifyPortClient,
  account_id: string
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: `/v1/accounts/${account_id}/auth/start`
  });
}

/**
 * 通过 WhatsApp 账号发送标准文本消息。
 *
 * 发送参数由 payloads.ts 统一生成，API 层只负责把它提交到 POST /v1/messages。
 */
export function sendWhatsAppTextMessage(
  client: UnifyPortClient,
  input: WhatsAppTextMessagePayloadInput
): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/messages",
    body: createWhatsAppTextMessagePayload(input)
  });
}
