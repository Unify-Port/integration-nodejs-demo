import { describe, expect, it } from "vitest";
import type { UnifyPortRequest } from "../../src/core/unifyport-client.js";
import { createCliRequestRecorder } from "../../src/cli/output.js";
import {
  getConversationsMenuChoices,
  runConversationsAction,
  runConversationsDemo,
  type ConversationsDemoRuntime
} from "../../src/cli/conversations-demo.js";
import type { CliSelectChoice } from "../../src/cli/select-prompt.js";

function createRuntime(
  promptAnswers: string[],
  selectAnswers: string[] = []
): {
  runtime: ConversationsDemoRuntime;
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

describe("conversations demo", () => {
  it("展示会话操作选择项", () => {
    const labels = getConversationsMenuChoices().map((choice) => choice.label);

    expect(labels).toContain("查询会话列表");
    expect(labels).toContain("查询会话详情");
    expect(labels).toContain("查询会话成员");
    expect(labels).toContain("查询会话标签列表");
    expect(labels).toContain("会话标签操作");
    expect(labels).toContain("返回上级菜单");
  });

  it("会话菜单通过 select adapter 选择流程", async () => {
    const { runtime, prompts, requests, selects } = createRuntime(
      ["acc_example", "", "", ""],
      ["1", "back"]
    );

    await runConversationsDemo(runtime);

    expect(prompts).toEqual(["account_id", "type", "limit", "cursor"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations"
      }
    ]);
    expect(selects[0]).toEqual({
      label: "请选择会话操作",
      choices: getConversationsMenuChoices()
    });
  });

  it("查询会话列表", async () => {
    const { runtime, prompts, requests, writes } = createRuntime([
      "acc_example",
      "user,group",
      "20",
      ""
    ]);

    const shouldContinue = await runConversationsAction(runtime, "1");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "type", "limit", "cursor"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations",
        query: {
          type: "user,group",
          limit: "20"
        }
      }
    ]);
    expect(writes).toContain(
      "GET /v1/accounts/acc_example/conversations?type=user%2Cgroup&limit=20"
    );
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

  it("查询会话详情", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example", "group"]);

    const shouldContinue = await runConversationsAction(runtime, "2");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id", "type"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/info",
        query: {
          conversation_id: "peer_example",
          type: "group"
        }
      }
    ]);
  });

  it("查询会话成员", async () => {
    const { runtime, prompts, requests } = createRuntime([
      "acc_example",
      "peer_example",
      "group",
      "50",
      ""
    ]);

    const shouldContinue = await runConversationsAction(runtime, "3");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id", "type", "limit", "cursor"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/members",
        query: {
          conversation_id: "peer_example",
          type: "group",
          limit: "50"
        }
      }
    ]);
  });

  it("查询会话列表时空的非必填参数不进入 query", async () => {
    const { runtime, requests, writes } = createRuntime(["acc_example", "", "", ""]);

    const shouldContinue = await runConversationsAction(runtime, "1");

    expect(shouldContinue).toBe(true);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations"
      }
    ]);
    expect(writes).toContain("GET /v1/accounts/acc_example/conversations");
  });

  it("查询会话列表输入参数前展示说明和格式", async () => {
    const { runtime, writes } = createRuntime(["acc_example", "", "", ""]);

    await runConversationsAction(runtime, "1");

    expect(writes).toContain(
      ["参数 account_id [必填]", "类型：string", "说明：账号 ID", "示例：acc_example"].join("\n")
    );
    expect(writes).toContain(
      [
        "参数 limit [可选]",
        "类型：number",
        "说明：分页条数",
        "示例：20",
        "空值：直接回车表示不传"
      ].join("\n")
    );
  });

  it("标记会话已读", async () => {
    const { runtime, prompts, requests } = createRuntime([
      "acc_example",
      "peer_example",
      "msg_example"
    ]);

    const shouldContinue = await runConversationsAction(runtime, "4");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id", "up_to_message_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/read",
        body: {
          conversation_id: "peer_example",
          up_to_message_id: "msg_example"
        }
      }
    ]);
  });

  it("标记会话未读", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example"]);

    const shouldContinue = await runConversationsAction(runtime, "5");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unread",
        body: {
          conversation_id: "peer_example"
        }
      }
    ]);
  });

  it("静音会话", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example", "86400"]);

    const shouldContinue = await runConversationsAction(runtime, "6");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id", "duration"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/mute",
        body: {
          conversation_id: "peer_example",
          duration: 86400
        }
      }
    ]);
  });

  it("取消静音会话", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example"]);

    const shouldContinue = await runConversationsAction(runtime, "7");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unmute",
        body: {
          conversation_id: "peer_example"
        }
      }
    ]);
  });

  it("置顶会话", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example"]);

    const shouldContinue = await runConversationsAction(runtime, "8");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/pin",
        body: {
          conversation_id: "peer_example"
        }
      }
    ]);
  });

  it("取消置顶会话", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "peer_example"]);

    const shouldContinue = await runConversationsAction(runtime, "9");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "conversation_id"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unpin",
        body: {
          conversation_id: "peer_example"
        }
      }
    ]);
  });

  it("查询会话标签列表", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "50", ""]);

    const shouldContinue = await runConversationsAction(runtime, "10");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "limit", "cursor"]);
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/labels",
        query: {
          limit: "50"
        }
      }
    ]);
  });

  it("创建或更新会话标签", async () => {
    const { runtime, prompts, requests } = createRuntime(["acc_example", "", "VIP"]);

    const shouldContinue = await runConversationsAction(runtime, "11");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "label_id", "name"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels/upsert",
        body: {
          name: "VIP"
        }
      }
    ]);
  });

  it("删除会话标签", async () => {
    const { runtime, prompts, requests } = createRuntime([
      "acc_example",
      "label_example",
      "DELETE"
    ]);

    const shouldContinue = await runConversationsAction(runtime, "12");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "label_id", "confirm_delete_label"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels/delete",
        body: {
          label_id: "label_example"
        }
      }
    ]);
  });

  it("未确认时不删除会话标签", async () => {
    const { runtime, prompts, requests, writes } = createRuntime([
      "acc_example",
      "label_example",
      "cancel"
    ]);

    const shouldContinue = await runConversationsAction(runtime, "12");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "label_id", "confirm_delete_label"]);
    expect(requests).toEqual([]);
    expect(writes).toContain("已取消删除会话标签。");
  });

  it("会话标签操作", async () => {
    const { runtime, prompts, requests } = createRuntime([
      "acc_example",
      "label_example",
      "add",
      "peer_example,peer_other"
    ]);

    const shouldContinue = await runConversationsAction(runtime, "13");

    expect(shouldContinue).toBe(true);
    expect(prompts).toEqual(["account_id", "label_id", "action", "conversation_ids"]);
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels",
        body: {
          label_id: "label_example",
          action: "add",
          conversation_ids: ["peer_example", "peer_other"]
        }
      }
    ]);
  });

  it("返回上级菜单", async () => {
    const { runtime, requests } = createRuntime([]);

    const shouldContinue = await runConversationsAction(runtime, "back");

    expect(shouldContinue).toBe(false);
    expect(requests).toEqual([]);
  });
});
