import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { UnifyPortRequest } from "../../src/core/unifyport-client.js";
import { createCliRequestRecorder } from "../../src/cli/output.js";
import {
  getDemoMenuChoices,
  runDemoSelection,
  type InteractiveDemoRuntime
} from "../../src/cli/interactive-demo.js";
import type { CliSelectChoice } from "../../src/cli/select-prompt.js";

function createRuntime(
  promptAnswers: string[],
  selectAnswers: string[] = []
): {
  runtime: InteractiveDemoRuntime;
  prompts: string[];
  requests: readonly UnifyPortRequest[];
  selects: Array<{
    label: string;
    choices: CliSelectChoice[];
  }>;
  writes: string[];
} {
  const prompts: string[] = [];
  const selects: Array<{
    label: string;
    choices: CliSelectChoice[];
  }> = [];
  const writes: string[] = [];
  let promptAnswerIndex = 0;
  let selectAnswerIndex = 0;
  const recorder = createCliRequestRecorder({
    baseUrl: "https://api.unifyport.ai",
    apiKey: "key_example",
    async fetch() {
      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  });
  const requests = recorder.getRequests();

  return {
    runtime: {
      recorder,
      async prompt(label) {
        prompts.push(label);
        const answer = promptAnswers[promptAnswerIndex] as string;
        promptAnswerIndex += 1;
        return answer;
      },
      async select(label, choices) {
        selects.push({
          label,
          choices
        });
        const answer = selectAnswers[selectAnswerIndex] as string;
        selectAnswerIndex += 1;
        return answer;
      },
      write(message) {
        writes.push(message);
      }
    },
    prompts,
    requests,
    selects,
    writes
  };
}

function createExitPromptError(): Error {
  const error = new Error("User force closed the prompt with SIGINT");

  error.name = "ExitPromptError";

  return error;
}

describe("interactive demo", () => {
  it("生产交互入口不混用 readline 和 inquirer", async () => {
    const interactiveDemoSource = await readFile("src/cli/interactive-demo.ts", "utf8");
    const conversationsSource = await readFile("src/cli/conversations.ts", "utf8");

    expect(interactiveDemoSource).not.toContain("node:readline/promises");
    expect(interactiveDemoSource).not.toContain("readline.question");
    expect(conversationsSource).not.toContain("node:readline/promises");
    expect(conversationsSource).not.toContain("readline.question");
  });

  it("主菜单展示通用能力域且不出现渠道字样", () => {
    const labels = getDemoMenuChoices().map((choice) => choice.label);

    expect(labels).toEqual([
      "基础检查",
      "账号相关",
      "授权相关",
      "消息演示",
      "Webhook 相关",
      "推荐流程",
      "全接口分组",
      "退出"
    ]);
    expect(labels).not.toContain("Runtime 相关");
    expect(labels.join("\n")).not.toContain("WhatsApp");
    expect(labels.join("\n")).not.toContain("whatsapp");
  });

  it("主菜单通过 select adapter 选择流程", async () => {
    const { runtime, prompts, requests, selects, writes } = createRuntime(
      [],
      ["accounts", "account_list", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual([]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts"
      }
    ]);
    expect(selects[0]).toEqual({
      label: "请选择要执行的 UnifyPort demo 流程",
      choices: getDemoMenuChoices()
    });
    const accountMenu = selects[1] as {
      label: string;
      choices: CliSelectChoice[];
    };

    expect(accountMenu.label).toBe("请选择账号相关流程");
    expect(writes).toEqual([
      "========== Request ==========",
      "GET /v1/accounts",
      "Query:",
      "无",
      "Body:",
      "无",
      "========== Response ==========",
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

  it("按下 Ctrl+C 时正常退出且不抛出堆栈", async () => {
    const { runtime, requests } = createRuntime([]);

    runtime.select = async function selectWithSigint() {
      throw createExitPromptError();
    };

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(false);
    expect(requests).toEqual([]);
  });

  it("渠道选择列表当前只包含 WhatsApp", async () => {
    const { runtime, selects } = createRuntime(
      [],
      ["accounts", "account_regions", "whatsapp", "back"]
    );

    await runDemoSelection(runtime);

    expect(selects[2]).toEqual({
      label: "请选择渠道",
      choices: [
        {
          label: "WhatsApp",
          value: "whatsapp"
        },
        {
          label: "返回上级菜单",
          value: "back"
        }
      ]
    });
  });

  it("选择 WhatsApp 后创建账号仍然复用现有 payload", async () => {
    const { runtime, prompts, requests, writes } = createRuntime(
      ["WhatsApp Support", "global", "8613800138000"],
      ["accounts", "account_create", "whatsapp", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

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
    expect(writes).toContain("POST /v1/accounts");
    expect(writes).toContain(
      JSON.stringify(
        {
          data: {
            ok: true
          }
        },
        null,
        2
      )
    );
  });

  it("快捷入口输入参数前展示说明和格式", async () => {
    const { runtime, writes } = createRuntime(
      ["WhatsApp Support", "global", "8613800138000"],
      ["accounts", "account_create", "whatsapp", "back"]
    );

    await runDemoSelection(runtime);

    expect(writes).toContain(
      ["参数 name [必填]", "类型：string", "说明：账号名称", "示例：WhatsApp Support"].join("\n")
    );
    expect(writes).toContain(
      [
        "参数 phone [必填]",
        "类型：string",
        "说明：WhatsApp 手机号，使用国际区号格式",
        "示例：8613800138000"
      ].join("\n")
    );
  });

  it("选择退出时结束交互流程", async () => {
    const { runtime, requests } = createRuntime([], ["exit"]);

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(false);
    expect(requests).toEqual([]);
  });

  it("Webhook 相关流程创建 endpoint 并提示 recipient_id 来源", async () => {
    const { runtime, prompts, requests, writes } = createRuntime(
      ["https://example.com/webhook", "secret_1"],
      ["webhook", "webhook_create_endpoint", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["url", "signing_secret"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/webhook-endpoints",
        body: {
          url: "https://example.com/webhook",
          status: "active",
          subscribed_events: ["*"],
          signing_secret: "secret_1",
          retry_policy: {
            max_attempts: 3
          }
        }
      }
    ]);
    expect(writes).toContain("接收消息前，请另开终端运行：pnpm demo:webhook:ngrok");
    expect(writes).toContain(
      "收到 message.received 后，复制 data.conversation.id 作为发送消息流程的 recipient_id。"
    );
  });

  it("Webhook 相关流程展示 ngrok 本地接收配置步骤", async () => {
    const { runtime, requests, writes } = createRuntime(
      [],
      ["webhook", "webhook_ngrok_guide", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(requests).toEqual([]);
    expect(writes).toContain("1. 确认本机已安装 ngrok 并完成 authtoken 配置。");
    expect(writes).toContain("2. 运行：pnpm demo:webhook:ngrok");
    expect(writes).toContain(
      "4. 回到本菜单选择“创建 webhook endpoint”，url 填控制台输出的 Webhook endpoint URL。"
    );
    expect(writes).toContain("6. 打开 http://127.0.0.1:4040 查看请求详情并使用 replay。");
  });

  it("授权相关流程包含四个 runtime 演示接口", async () => {
    const { runtime, prompts, requests, selects, writes } = createRuntime(
      ["acc_start", "acc_refresh", "acc_reconnect", "acc_stop", "STOP"],
      ["auth", "runtime_start", "runtime_refresh", "runtime_reconnect", "runtime_stop", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual([
      "account_id",
      "account_id",
      "account_id",
      "account_id",
      "confirm_stop_runtime"
    ]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_start/runtime/start",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_refresh/runtime/refresh",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_reconnect/runtime/reconnect",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_stop/runtime/stop",
        body: {}
      }
    ]);
    const authMenu = selects[1] as {
      label: string;
      choices: CliSelectChoice[];
    };

    expect(authMenu.label).toBe("请选择授权相关流程");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("刷新 runtime 状态");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("启动 runtime");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("重连 runtime");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("停止 runtime");
    expect(writes).toContain("POST /v1/accounts/acc_start/runtime/start");
    expect(writes).toContain("POST /v1/accounts/acc_refresh/runtime/refresh");
    expect(writes).toContain("POST /v1/accounts/acc_reconnect/runtime/reconnect");
    expect(writes).toContain("POST /v1/accounts/acc_stop/runtime/stop");
    expect(writes).toContain(
      JSON.stringify(
        {
          data: {
            ok: true
          }
        },
        null,
        2
      )
    );
  });

  it("停止 runtime 未确认时不发起请求", async () => {
    const { runtime, prompts, requests, writes } = createRuntime(
      ["acc_stop", "NO"],
      ["auth", "runtime_stop", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "confirm_stop_runtime"]);
    expect(requests).toEqual([]);
    expect(writes).toContain("已取消停止 runtime。");
  });

  it("授权流程直接按账号启动验证码或手机号配对", async () => {
    const { runtime, prompts, requests, selects, writes } = createRuntime(
      ["acc_example"],
      ["auth", "auth_start", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/start",
        body: {}
      }
    ]);
    const authMenu = selects[1] as {
      label: string;
      choices: CliSelectChoice[];
    };

    expect(authMenu.choices.map((choice) => choice.label)).toContain("启动验证码/手机号配对");
    expect(authMenu.choices.map((choice) => choice.label).join("\n")).not.toContain("WhatsApp");
    expect(writes).toContain("POST /v1/accounts/acc_example/auth/start");
  });

  it("授权相关流程提供账号认证向导和完整认证动作", async () => {
    const { runtime, prompts, requests, selects, writes } = createRuntime(
      ["acc_example", "123456", "second_password"],
      [
        "auth",
        "auth_guide",
        "auth_method_code",
        "auth_next_code",
        "auth_next_password",
        "auth_next_skip",
        "back"
      ]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "code", "password"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/start",
        body: {}
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/code",
        body: {
          code: "123456"
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/password",
        body: {
          password: "second_password"
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      }
    ]);
    const authMenu = selects[1] as {
      label: string;
      choices: CliSelectChoice[];
    };

    expect(authMenu.choices.map((choice) => choice.label)).toContain("账号认证向导");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("提交验证码");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("启动二维码认证");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("检查二维码认证");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("提交二次认证密码");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("导入 Session");
    expect(authMenu.choices.map((choice) => choice.label)).toContain("取消认证");
    expect(writes).toContain("GET /v1/accounts/acc_example/auth");
    expect(writes).toContain("POST /v1/accounts/acc_example/auth/password");
  });

  it("消息发送流程文案通用化且发送文本消息请求不回归", async () => {
    const { runtime, prompts, requests, selects, writes } = createRuntime(
      ["acc_example", "recipient_example", "hello"],
      ["messages", "message_send_text", "whatsapp", "back"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "recipient_id", "text"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          account_id: "acc_example",
          to: {
            id: "recipient_example",
            type: "user"
          },
          message: {
            type: "text",
            text: "hello"
          }
        }
      }
    ]);
    const messageMenu = selects[1] as {
      label: string;
      choices: CliSelectChoice[];
    };

    expect(messageMenu.choices.map((choice) => choice.label)).toContain("发送文本消息");
    expect(messageMenu.choices.map((choice) => choice.label).join("\n")).not.toContain("WhatsApp");
    expect(writes).toContain("POST /v1/messages");
  });

  it("推荐流程选择渠道后串联基础检查、账号、授权、runtime 和消息发送", async () => {
    const { runtime, prompts, requests } = createRuntime(
      ["Demo Account", "global", "8613800138000", "acc_example", "recipient_example", "hello"],
      ["recommended", "whatsapp", "auth_method_code", "auth_next_skip", "continue_runtime"]
    );

    const shouldContinue = await runDemoSelection(runtime);

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["name", "region", "phone", "account_id", "recipient_id", "text"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/workspace"
      },
      {
        method: "GET",
        path: "/v1/providers/whatsapp/regions"
      },
      {
        method: "GET",
        path: "/v1/accounts"
      },
      {
        method: "POST",
        path: "/v1/accounts",
        body: {
          name: "Demo Account",
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
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/start",
        body: {}
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/start",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/refresh",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          account_id: "acc_example",
          to: {
            id: "recipient_example",
            type: "user"
          },
          message: {
            type: "text",
            text: "hello"
          }
        }
      }
    ]);
  });
});
