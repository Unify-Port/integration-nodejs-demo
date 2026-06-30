export interface CreateWhatsAppCodeAccountPayloadInput {
  name: string;
  region: string;
  phone: string;
}

export interface WhatsAppCodeAccountPayload {
  name: string;
  provider: "whatsapp";
  region: string;
  status: "active";
  auth_mode: "code";
  provider_data: {
    phone: string;
  };
}

export interface WhatsAppTextMessagePayloadInput {
  account_id: string;
  to: {
    id: string;
    type: "user";
  };
  text: string;
}

export interface WhatsAppTextMessagePayload {
  account_id: string;
  to: {
    id: string;
    type: "user";
  };
  message: {
    type: "text";
    text: string;
  };
}

/**
 * 生成 WhatsApp 手机号配对模式的账号创建参数。
 *
 * 字段严格对应文档里的 POST /v1/accounts 示例：provider 固定为 whatsapp，
 * auth_mode 固定为 code，手机号只放在 provider_data.phone。
 */
export function createWhatsAppCodeAccountPayload(
  input: CreateWhatsAppCodeAccountPayloadInput
): WhatsAppCodeAccountPayload {
  return {
    name: input.name,
    provider: "whatsapp",
    region: input.region,
    status: "active",
    auth_mode: "code",
    provider_data: {
      phone: input.phone
    }
  };
}

/**
 * 生成 WhatsApp 文本消息发送参数。
 *
 * 字段严格对应文档里的 POST /v1/messages 示例：account_id、to 和 message
 * 位于顶层，文本内容只放在 message.text。
 */
export function createWhatsAppTextMessagePayload(
  input: WhatsAppTextMessagePayloadInput
): WhatsAppTextMessagePayload {
  return {
    account_id: input.account_id,
    to: input.to,
    message: {
      type: "text",
      text: input.text
    }
  };
}
