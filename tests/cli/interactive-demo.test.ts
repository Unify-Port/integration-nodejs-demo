import { describe, expect, it } from "vitest";
import type { UnifyPortClient, UnifyPortRequest } from "../../src/core/unifyport-client.js";
import { createCliRequestRecorder } from "../../src/cli/output.js";
import {
  getDemoMenuText,
  runDemoAction,
  type InteractiveDemoRuntime
} from "../../src/cli/interactive-demo.js";

function createRuntime(answers: string[]): {
  runtime: InteractiveDemoRuntime;
  prompts: string[];
  requests: UnifyPortRequest[];
  writes: string[];
} {
  const prompts: string[] = [];
  const requests: UnifyPortRequest[] = [];
  const writes: string[] = [];
  let answerIndex = 0;
  const client: UnifyPortClient = {
    async request(request) {
      requests.push(request);
      return {
        data: {
          ok: true
        }
      };
    }
  };
  const recorder = createCliRequestRecorder(client);

  return {
    runtime: {
      recorder,
      async prompt(label) {
        prompts.push(label);
        const answer = answers[answerIndex] as string;
        answerIndex += 1;
        return answer;
      },
      write(message) {
        writes.push(message);
      }
    },
    prompts,
    requests,
    writes
  };
}

describe("interactive demo", () => {
  it("展示可选择的安全演示流程", () => {
    const menuText = getDemoMenuText();

    expect(menuText).toContain("1. workspace 校验");
    expect(menuText).toContain("2. 查询 WhatsApp 可用区域");
    expect(menuText).toContain("3. 创建 WhatsApp 账号");
    expect(menuText).toContain("7. 发送 WhatsApp 文本消息");
    expect(menuText).toContain("0. 退出");
  });

  it("根据逐项输入创建 WhatsApp 账号", async () => {
    const { runtime, prompts, requests, writes } = createRuntime([
      "WhatsApp Support",
      "global",
      "8613800138000"
    ]);

    const shouldContinue = await runDemoAction(runtime, "3");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["name", "region", "phone"]);
    expect(requests).toEqual([
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
      }
    ]);
    expect(writes).toEqual([
      "POST /v1/accounts",
      JSON.stringify(
        {
          data: {
            ok: true
          }
        },
        null,
        2
      )
    ]);
  });

  it("选择退出时结束交互流程", async () => {
    const { runtime, requests } = createRuntime([]);

    const shouldContinue = await runDemoAction(runtime, "0");

    expect(shouldContinue).toBe(false);
    expect(requests).toEqual([]);
  });
});
