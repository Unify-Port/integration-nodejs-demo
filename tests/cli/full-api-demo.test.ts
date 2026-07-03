import { describe, expect, it } from "vitest";
import type { UnifyPortClient, UnifyPortRequest } from "../../src/core/unifyport-client.js";
import { createCliRequestRecorder } from "../../src/cli/output.js";
import {
  FULL_API_DEMO_ACTIONS,
  getFullApiDemoActionCount,
  type FullApiDemoRuntime
} from "../../src/cli/full-api-demo.js";
import type { CliSelectChoice } from "../../src/cli/select-prompt.js";

function createRuntime(
  promptAnswers: string[],
  selectAnswers: string[] = []
): {
  runtime: FullApiDemoRuntime;
  prompts: string[];
  requests: UnifyPortRequest[];
  selects: Array<{
    label: string;
    choices: CliSelectChoice[];
  }>;
  writes: string[];
} {
  const prompts: string[] = [];
  const requests: UnifyPortRequest[] = [];
  const selects: Array<{
    label: string;
    choices: CliSelectChoice[];
  }> = [];
  const writes: string[] = [];
  let promptAnswerIndex = 0;
  let selectAnswerIndex = 0;
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

function getAction(key: string) {
  for (const action of FULL_API_DEMO_ACTIONS) {
    if (action.key === key) {
      return action;
    }
  }

  throw new Error(`missing action ${key}`);
}

describe("full api demo", () => {
  it("暴露官方文档中的 68 个接口入口", () => {
    expect(getFullApiDemoActionCount()).toBe(68);
  });

  it("全接口模块只暴露全接口分组入口", () => {
    const titles = FULL_API_DEMO_ACTIONS.map((action) => action.title);

    expect(titles).toEqual(["全接口分组"]);
  });

  it("全接口分组菜单通过 select 展示所有资源分组入口", async () => {
    const { runtime, prompts, selects } = createRuntime([], ["back"]);
    const action = getAction("full_api");

    await action.run(runtime);

    expect(prompts).toEqual([]);
    expect(selects[0]).toEqual({
      label: "请选择全接口分组",
      choices: [
        { label: "Workspace", value: "1" },
        { label: "Providers", value: "2" },
        { label: "Accounts", value: "3" },
        { label: "Authentication", value: "4" },
        { label: "Runtime", value: "5" },
        { label: "Conversations", value: "6" },
        { label: "Messages", value: "7" },
        { label: "Contacts", value: "8" },
        { label: "Groups", value: "9" },
        { label: "API Keys", value: "10" },
        { label: "Webhook Endpoints", value: "11" },
        { label: "返回上级菜单", value: "back" }
      ]
    });
  });

  it("Accounts 菜单中未确认 DELETE 时不发起删除请求", async () => {
    const { runtime, prompts, requests, writes } = createRuntime(
      ["acc_example", "cancel"],
      ["3", "5", "back", "back"]
    );
    const action = getAction("full_api");

    await action.run(runtime);

    expect(prompts).toEqual(["account_id", "confirm_delete_account"]);
    expect(requests).toEqual([]);
    expect(writes).toContain("已取消删除账号。");
  });

  it("Contacts 菜单空的非必填参数不进入 query", async () => {
    const { runtime, requests, writes } = createRuntime(
      ["acc_example", "", "", "", ""],
      ["8", "1", "back", "back"]
    );
    const action = getAction("full_api");

    await action.run(runtime);

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/contacts",
        query: {}
      }
    ]);
    expect(writes).toContain("GET /v1/accounts/acc_example/contacts");
  });

  it("Messages 菜单发送文本消息时输出对应接口", async () => {
    const { runtime, requests, writes } = createRuntime(
      ["acc_example", "user", "recipient_example", "hello", ""],
      ["7", "1", "back", "back"]
    );
    const action = getAction("full_api");

    await action.run(runtime);

    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/messages",
        body: {
          account_id: "acc_example",
          to: {
            type: "user",
            id: "recipient_example"
          },
          message: {
            type: "text",
            text: "hello"
          }
        }
      }
    ]);
    expect(writes).toContain("POST /v1/messages");
  });

  it("Messages 菜单输入参数前展示说明和格式", async () => {
    const { runtime, writes } = createRuntime(
      ["acc_example", "user", "recipient_example", "hello", ""],
      ["7", "1", "back", "back"]
    );
    const action = getAction("full_api");

    await action.run(runtime);

    expect(writes).toContain(
      ["参数 account_id [必填]", "类型：string", "说明：账号 ID", "示例：acc_example"].join("\n")
    );
    expect(writes).toContain(
      [
        "参数 provider_data [可选]",
        "类型：JSON object",
        "说明：渠道扩展字段",
        '示例：{"parse_mode":"markdown"}',
        "空值：直接回车表示不传"
      ].join("\n")
    );
  });
});
