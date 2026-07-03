import { describe, expect, it } from "vitest";
import { writeWebhookEvent } from "../../src/webhook/event-output.js";

describe("writeWebhookEvent", () => {
  it("收到 message.received 时打印事件摘要和消息提示", () => {
    const writes: string[] = [];
    const event = {
      id: "evt_2f9c1a4b7e",
      type: "message.received",
      provider: "whatsapp",
      account_id: "acc_8c21d0",
      occurred_at: "2026-06-08T12:34:56Z",
      data: {
        conversation: {
          id: "8613912345678",
          type: "user",
          title: "Jordan Lee"
        },
        sender: {
          id: "8613912345678",
          type: "user",
          name: "Jordan Lee"
        },
        message: {
          id: "wamid.HBgM",
          type: "text",
          text: "Hi",
          direction: "inbound"
        },
        event: {
          kind: "message_received"
        }
      }
    };

    writeWebhookEvent((message) => writes.push(message), event);

    expect(writes).toEqual([
      "========== Webhook Event ==========",
      "id: evt_2f9c1a4b7e",
      "type: message.received",
      "description: An inbound message arrived on the account.",
      "provider: whatsapp",
      "account_id: acc_8c21d0",
      "occurred_at: 2026-06-08T12:34:56Z",
      "========== Event Hints ==========",
      "data.event.kind: message_received",
      "data.conversation.id: 8613912345678",
      "recipient_id: 8613912345678",
      "data.conversation.type: user",
      "data.conversation.title: Jordan Lee",
      "data.sender.id: 8613912345678",
      "data.sender.type: user",
      "data.sender.name: Jordan Lee",
      "data.message.id: wamid.HBgM",
      "data.message.type: text",
      "data.message.text: Hi",
      "data.message.direction: inbound",
      "========== Event Data ==========",
      JSON.stringify(event.data, null, 2),
      "========== Raw Event ==========",
      JSON.stringify(event, null, 2)
    ]);
  });

  it("收到账号认证事件时打印认证和运行状态提示", () => {
    const writes: string[] = [];
    const event = {
      id: "evt_auth_5e6f7a8b9c",
      type: "account.auth.failed",
      provider: "whatsapp",
      account_id: "acc_8c21d0",
      occurred_at: "2026-06-08T13:25:00Z",
      data: {
        auth_status: "failed",
        runtime_status: "disconnected",
        last_error: "logged_out_from_another_device",
        event: {
          kind: "account_auth_status"
        }
      }
    };

    writeWebhookEvent((message) => writes.push(message), event);

    expect(writes).toContain("type: account.auth.failed");
    expect(writes).toContain("description: An authentication attempt failed.");
    expect(writes).toContain("data.event.kind: account_auth_status");
    expect(writes).toContain("data.auth_status: failed");
    expect(writes).toContain("data.runtime_status: disconnected");
    expect(writes).toContain("data.last_error: logged_out_from_another_device");
    expect(writes).toContain(JSON.stringify(event.data, null, 2));
  });
});
