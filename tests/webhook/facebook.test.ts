import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyUnifyPortSignature } from "../../src/webhook/signature.js";
import { writeWebhookEvent } from "../../src/webhook/event-output.js";

/** FB 使用已有标准签名，不应按渠道重建 JSON 或把自同步解释为入站。 */
describe("Facebook standard Webhooks", () => {
  it("verifies the original bytes and retains outbound identity and fractional time", () => {
    const rawBody = Buffer.from(
      '{ "id":"evt_facebook_example", "type":"message.received", "provider":"facebook", "account_id":"acc_example", "occurred_at":"2026-01-01T00:00:00.123456789Z", "data":{"message":{"id":"9007199254740993","direction":"outbound","text":"Hello"}} }'
    );
    const signingSecret = "fictional-secret";
    const timestamp = "2026-01-01T00:00:01Z";
    const signature = createHmac("sha256", signingSecret)
      .update(timestamp + ".")
      .update(rawBody)
      .digest("hex");
    expect(verifyUnifyPortSignature({ rawBody, signingSecret, timestamp, signature })).toBe(true);
    expect(
      verifyUnifyPortSignature({
        rawBody: Buffer.from(JSON.stringify(JSON.parse(rawBody.toString()))),
        signingSecret,
        timestamp,
        signature
      })
    ).toBe(false);
    const writes: string[] = [];
    writeWebhookEvent((line) => writes.push(line), JSON.parse(rawBody.toString()));
    expect(writes).toContain("provider: facebook");
    expect(writes).toContain("data.message.direction: outbound");
    expect(writes).toContain("data.message.id: 9007199254740993");
    expect(writes.join("\n")).toContain("2026-01-01T00:00:00.123456789Z");
  });

  it("does not interpret an ordinary runtime error as revoked authorization", () => {
    const writes: string[] = [];
    writeWebhookEvent((line) => writes.push(line), {
      id: "evt_facebook_error",
      type: "account.status.updated",
      provider: "facebook",
      account_id: "acc_example",
      occurred_at: "2026-01-01T00:00:00Z",
      data: { runtime_status: "error", last_error: "network_timeout" }
    });
    expect(writes).toContain("data.runtime_status: error");
    expect(writes.join("\n")).not.toContain("auth_status: failed");
  });
});
