import { describe, expect, it } from "vitest";
import type { UnifyPortClient } from "../../../src/core/unifyport-client.js";
import {
  createWhatsAppCodeAccount,
  listWhatsAppRegions,
  sendWhatsAppTextMessage,
  startWhatsAppCodeAuth
} from "../../../src/channels/whatsapp/api.js";

describe("WhatsApp API", () => {
  it("按 WhatsApp Quickstart 顺序调用账号、授权和消息接口", async () => {
    const requests: Array<Parameters<UnifyPortClient["request"]>[0]> = [];
    const client: UnifyPortClient = {
      async request(request) {
        requests.push(request);
        return { data: { ok: true } };
      }
    };

    await listWhatsAppRegions(client);
    await createWhatsAppCodeAccount(client, {
      name: "WhatsApp Support",
      region: "global",
      phone: "8613800138000"
    });
    await startWhatsAppCodeAuth(client, "acc_example");
    await sendWhatsAppTextMessage(client, {
      account_id: "acc_example",
      to: {
        id: "8613912345678@s.whatsapp.net",
        type: "user"
      },
      text: "Hello from UnifyPort"
    });

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/providers/whatsapp/regions"
      },
      {
        method: "POST",
        path: "/v1/accounts",
        body: {
          name: "WhatsApp Support",
          provider: "whatsapp",
          region: "global",
          status: "active",
          auth_mode: "code",
          provider_data: {
            phone: "8613800138000"
          }
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/start"
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          account_id: "acc_example",
          to: {
            id: "8613912345678@s.whatsapp.net",
            type: "user"
          },
          message: {
            type: "text",
            text: "Hello from UnifyPort"
          }
        }
      }
    ]);
  });
});
