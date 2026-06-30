import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyUnifyPortSignature } from "../../src/webhook/signature.js";

describe("verifyUnifyPortSignature", () => {
  it("使用 X-Device-Timestamp 和原始请求体校验 X-Device-Signature", () => {
    const rawBody = Buffer.from(JSON.stringify({ type: "message.received" }));
    const timestamp = "2026-06-08T12:34:56Z";
    const signingSecret = "secret_1";
    const hmac = crypto.createHmac("sha256", signingSecret);
    hmac.update(timestamp + ".");
    hmac.update(rawBody);
    const signature = hmac.digest("hex");

    const result = verifyUnifyPortSignature({
      rawBody,
      timestamp,
      signature,
      signingSecret
    });

    expect(result).toBe(true);
  });

  it("签名不一致时返回 false", () => {
    const result = verifyUnifyPortSignature({
      rawBody: Buffer.from(JSON.stringify({ type: "message.received" })),
      timestamp: "2026-06-08T12:34:56Z",
      signature: "invalid_signature",
      signingSecret: "secret_1"
    });

    expect(result).toBe(false);
  });
});
