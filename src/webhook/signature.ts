import crypto from "node:crypto";

export interface VerifyUnifyPortSignatureInput {
  rawBody: Buffer;
  timestamp: string;
  signature: string;
  signingSecret: string;
}

/**
 * 校验 UnifyPort Webhook 签名。
 *
 * 文档规定签名内容为 X-Device-Timestamp、英文句点和原始请求体字节：
 * "<X-Device-Timestamp>" + "." + "<raw request body>"。这里必须使用 rawBody，
 * 不能把 JSON 解析后再序列化，否则字段顺序或空白变化都会导致签名不一致。
 */
export function verifyUnifyPortSignature(input: VerifyUnifyPortSignatureInput): boolean {
  const hmac = crypto.createHmac("sha256", input.signingSecret);
  hmac.update(input.timestamp + ".");
  hmac.update(input.rawBody);
  const expected = hmac.digest("hex");

  if (input.signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(input.signature), Buffer.from(expected));
}
