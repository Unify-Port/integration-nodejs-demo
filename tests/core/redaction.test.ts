import { describe, expect, it } from "vitest";
import { redactForOutput } from "../../src/core/redaction.js";

/** 授权材料可带渠道自定义字段，不能依赖逐个猜测凭证字段名来保护日志。 */
describe("authorization output redaction", () => {
  it.each([
    [{ pin: "private_pin", state: "private_state", challenge: "private_challenge" }],
    ["private_payload"],
    [[{ opaque: "private_material" }]],
    [null]
  ])("redacts the entire auth_payload %j while preserving status", (auth_payload) => {
    const input = {
      data: {
        auth_status: "awaiting_qr_scan",
        runtime_status: "disconnected",
        auth_payload,
        enabled: false,
        count: 0,
        values: [],
        next_cursor: ""
      }
    };
    const before = structuredClone(input);
    expect(redactForOutput(input)).toEqual({
      data: { ...input.data, auth_payload: "[REDACTED]" }
    });
    expect(input).toEqual(before);
  });

  it("redacts standalone and nested PINs without masking pin state", () => {
    const input = { pin: "private_pin", items: [{ pin: "private_nested_pin", pinned: false }] };
    expect(redactForOutput(input)).toEqual({
      pin: "[REDACTED]",
      items: [{ pin: "[REDACTED]", pinned: false }]
    });
    expect(input.items[0].pin).toBe("private_nested_pin");
  });
});
