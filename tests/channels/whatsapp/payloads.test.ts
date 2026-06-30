import { describe, expect, it } from "vitest";
import {
  createWhatsAppCodeAccountPayload,
  createWhatsAppTextMessagePayload
} from "../../../src/channels/whatsapp/payloads.js";

describe("WhatsApp payloads", () => {
  it("生成 WhatsApp code 授权账号创建参数", () => {
    const payload = createWhatsAppCodeAccountPayload({
      name: "WhatsApp Support",
      region: "global",
      phone: "8613800138000"
    });

    expect(payload).toEqual({
      name: "WhatsApp Support",
      provider: "whatsapp",
      region: "global",
      status: "active",
      auth_mode: "code",
      provider_data: {
        phone: "8613800138000"
      }
    });
  });

  it("生成 WhatsApp 文本消息发送参数", () => {
    const payload = createWhatsAppTextMessagePayload({
      account_id: "acc_example",
      to: {
        id: "8613912345678@s.whatsapp.net",
        type: "user"
      },
      text: "Hello from UnifyPort"
    });

    expect(payload).toEqual({
      account_id: "acc_example",
      to: {
        id: "8613912345678@s.whatsapp.net",
        type: "user"
      },
      message: {
        type: "text",
        text: "Hello from UnifyPort"
      }
    });
  });
});
