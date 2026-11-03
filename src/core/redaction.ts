/** 授权材料整体保护，避免渠道新增未知字段时把凭证带入共享终端记录。 */
const SENSITIVE_KEY =
  /(?:api[_-]?key|authorization|auth_payload|cookie|password|secret|token|session|webauthn|passkey|provider_data|provider_profile|proxy|static_(?:pri|pub)_key|identity_(?:pri|pub)_key|auth_?hex|(?:^|_)pin$|(?:^|_)code$|(?:^|_)url$|^url$)/iu;

/** 复制后脱敏，避免改变 Webhook 验签输入或调用方用于后续处理的对象。 */
export function redactForOutput(value: unknown, parentKey = ""): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactForOutput(item, parentKey));
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    /** 短机器分类可用于诊断；授权 code 与一次性链接仍然脱敏。 */
    const diagnostic =
      (key === "last_error_code" ||
        key === "numeric_code" ||
        (parentKey === "error" && key === "code")) &&
      typeof item === "string" &&
      /^[A-Za-z0-9_.:-]{1,64}$/u.test(item);
    if (SENSITIVE_KEY.test(key) && !diagnostic) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = redactForOutput(item, key);
    }
  }
  return output;
}
