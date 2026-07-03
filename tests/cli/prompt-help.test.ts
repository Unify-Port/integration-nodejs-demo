import { describe, expect, it } from "vitest";
import { promptCliField, type CliPromptRuntime } from "../../src/cli/prompt-help.js";

function createRuntime(answer: string): {
  runtime: CliPromptRuntime;
  prompts: string[];
  writes: string[];
} {
  const prompts: string[] = [];
  const writes: string[] = [];

  return {
    runtime: {
      async prompt(label) {
        prompts.push(label);
        return answer;
      },
      write(message) {
        writes.push(message);
      }
    },
    prompts,
    writes
  };
}

describe("prompt help", () => {
  it("输入前展示字段说明、格式和示例", async () => {
    const { runtime, prompts, writes } = createRuntime("whatsapp");

    const value = await promptCliField(runtime, {
      name: "provider",
      required: true,
      type: "string",
      description: "渠道名称",
      example: "whatsapp",
      emptyHint: ""
    });

    expect(value).toBe("whatsapp");
    expect(prompts).toEqual(["provider"]);
    expect(writes).toEqual([
      ["参数 provider [必填]", "类型：string", "说明：渠道名称", "示例：whatsapp"].join("\n")
    ]);
  });

  it("可选字段展示空回车含义", async () => {
    const { runtime, writes } = createRuntime("");

    await promptCliField(runtime, {
      name: "provider_data",
      required: false,
      type: "JSON object",
      description: "渠道扩展字段",
      example: '{"phone":"8613800138000"}',
      emptyHint: "直接回车表示不传"
    });

    expect(writes).toEqual([
      [
        "参数 provider_data [可选]",
        "类型：JSON object",
        "说明：渠道扩展字段",
        '示例：{"phone":"8613800138000"}',
        "空值：直接回车表示不传"
      ].join("\n")
    ]);
  });
});
