import { describe, expect, it } from "vitest";
import { createCliRequestRecorder, writeCliResponse } from "../../src/cli/output.js";
import { FULL_API_DEMO_ACTIONS, type FullApiDemoRuntime } from "../../src/cli/full-api-demo.js";
import { runDemoAction } from "../../src/cli/interactive-demo.js";
import { runPublishedApiDemo } from "../../src/cli/published-api-demo.js";
import { writeWebhookEvent } from "../../src/webhook/event-output.js";
import type { UnifyPortRequest } from "../../src/core/unifyport-client.js";

/** 离线记录请求序列，区分只读预检、写入受理与真正发送，禁止测试触达线上。 */
function fixture(
  answers: string[],
  choices: string[],
  response: (r: UnifyPortRequest) => unknown = () => ({ data: {} })
) {
  const requests: UnifyPortRequest[] = [];
  const writes: string[] = [];
  const runtime: FullApiDemoRuntime = {
    recorder: createCliRequestRecorder({
      request: async (r) => {
        requests.push(r);
        return response(r);
      }
    }),
    prompt: async () => {
      const answer = answers.shift();
      if (answer === undefined) throw new Error("Missing prompt answer");
      return answer;
    },
    select: async () => {
      const answer = choices.shift();
      if (answer === undefined) throw new Error("Missing select answer");
      return answer;
    },
    write: (message) => writes.push(message)
  };
  return { runtime, requests, writes };
}
const cases: [string, string[], string, string][] = [
  ["getAccountOperation", ["op_example"], "GET", "/v1/account-operations/op_example"],
  [
    "createAccountAuthSession",
    ["acc_example", "CONFIRM"],
    "POST",
    "/v1/accounts/acc_example/auth-sessions"
  ],
  [
    "submitAccountPasskeyResponse",
    ["acc_example", "serialized_private", "CONFIRM"],
    "POST",
    "/v1/accounts/acc_example/auth/passkey-response"
  ],
  [
    "confirmAccountPasskey",
    ["acc_example", "CONFIRM"],
    "POST",
    "/v1/accounts/acc_example/auth/passkey-confirm"
  ],
  [
    "createContact",
    ["acc_example", "123456", "CONFIRM"],
    "POST",
    "/v1/accounts/acc_example/contacts/add"
  ],
  [
    "getContactMembership",
    ["acc_example", "123@lid"],
    "GET",
    "/v1/accounts/acc_example/contacts/membership"
  ],
  [
    "requestConversationHistory",
    [
      "acc_example",
      "123@lid",
      "msg_example",
      "2026-11-03T01:02:03.123456789Z",
      "inbound",
      "CONFIRM"
    ],
    "POST",
    "/v1/accounts/acc_example/conversations/history/request"
  ],
  ["listPosts", ["acc_example"], "GET", "/v1/accounts/acc_example/posts"],
  ["getPost", ["acc_example", "9007199254740993"], "POST", "/v1/accounts/acc_example/posts/info"],
  [
    "listPostComments",
    ["acc_example", "9007199254740993"],
    "POST",
    "/v1/accounts/acc_example/posts/comments/list"
  ],
  [
    "replyPostComment",
    ["acc_example", "9007199254740993", "9007199254740995", "hello", "CONFIRM"],
    "POST",
    "/v1/accounts/acc_example/posts/comments/reply"
  ],
  ["createCall", ["acc_example", "user_example", "voice", "CALL"], "POST", "/v1/calls"],
  ["getActiveCall", ["acc_example"], "GET", "/v1/calls/active"],
  ["hangupCall", ["acc_example", "call_example", "HANGUP"], "POST", "/v1/calls/call_example/hangup"]
];
describe("published SDK adoption", () => {
  it.each(cases)("runs %s through its reviewed wrapper", async (id, answers, method, path) => {
    const { runtime, requests, writes } = fixture([...answers], [id]);
    await runPublishedApiDemo(runtime);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ method, path });
    expect(writes.join("\n")).not.toContain("serialized_private");
  });
  it("requires explicit call confirmation", async () => {
    const { runtime, requests } = fixture(
      ["acc_example", "user_example", "voice", "NO"],
      ["createCall"]
    );
    await runPublishedApiDemo(runtime);
    expect(requests).toEqual([]);
  });
  it("passes account pagination without automatic next-page requests", async () => {
    const { runtime, requests } = fixture(["1", "opaque_cursor"], ["3", "1", "back", "back"]);
    await FULL_API_DEMO_ACTIONS[0].run(runtime);
    expect(requests).toEqual([
      { method: "GET", path: "/v1/accounts", query: { limit: 1, cursor: "opaque_cursor" } }
    ]);
  });
  it.each([null, { data: { operation_id: "op_example", state: "PENDING" } }])(
    "handles deletion result %j without resubmission",
    async (response) => {
      const choices = ["3", "5"];
      if (response !== null) choices.push("query");
      choices.push("back", "back");
      const { runtime, requests } = fixture(["acc_example", "DELETE"], choices, () => response);
      await FULL_API_DEMO_ACTIONS[0].run(runtime);
      expect(requests.filter((r) => r.method === "DELETE")).toHaveLength(1);
      expect(requests.length).toBe(response === null ? 1 : 2);
      if (response !== null) expect(requests[1].path).toBe("/v1/account-operations/op_example");
    }
  );
  it.each(["stopped", "starting", "running"])(
    "gates Facebook media for %s",
    async (runtime_status) => {
      const answers = ["acc_example"];
      const choices = ["facebook_send_media"];
      if (runtime_status === "running") {
        answers.push("9007199254740993", "https://example.com/media");
        choices.push("image");
      }
      choices.push("back");
      const { runtime, requests } = fixture(answers, choices, () => ({ data: { runtime_status } }));
      await runDemoAction(runtime, "messages");
      expect(requests.filter((r) => r.path === "/v1/messages")).toHaveLength(
        runtime_status === "running" ? 1 : 0
      );
      if (runtime_status === "running")
        expect(requests[1].body).toEqual({
          account_id: "acc_example",
          to: { id: "9007199254740993", type: "user" },
          message: { type: "image", url: "https://example.com/media" }
        });
    }
  );
  it.each([
    ["group", ""],
    ["user", "caption"]
  ])("blocks unsupported Facebook generic media %s/%s", async (type, caption) => {
    const { runtime, requests } = fixture(
      ["acc_example", type, "9007199254740993", "image", "https://example.com/media", caption],
      ["7", "2"],
      () => ({ data: { provider: "facebook" } })
    );
    await expect(FULL_API_DEMO_ACTIONS[0].run(runtime)).rejects.toThrow("Facebook");
    expect(requests.filter((r) => r.path === "/v1/messages")).toEqual([]);
  });
  it("redacts all output paths without mutating signed event input", () => {
    const event = {
      type: "call.incoming",
      provider: "facebook",
      occurred_at: "2026-11-03T01:02:03.123456789Z",
      data: {
        join_url: "private_join",
        reply_token: "private_reply",
        provider_profile: { cookie: "private_cookie" },
        message: { id: "9007199254740993", sent_at: 123, flag: false, list: [] },
        count: 0
      }
    };
    const before = JSON.stringify(event);
    const writes: string[] = [];
    writeWebhookEvent((s) => writes.push(s), event);
    writeCliResponse(
      (s) => writes.push(s),
      {
        method: "POST",
        path: "/v1/accounts",
        body: { session_url: "private_session", webauthn_response: "private_passkey" }
      },
      event
    );
    const output = writes.join("\n");
    for (const value of [
      "private_join",
      "private_reply",
      "private_cookie",
      "private_session",
      "private_passkey"
    ])
      expect(output).not.toContain(value);
    expect(output).toContain("9007199254740993");
    expect(output).toContain(event.occurred_at);
    expect(output).toContain('"flag": false');
    expect(output).toContain('"count": 0');
    expect(JSON.stringify(event)).toBe(before);
  });
});

// 幂等身份由调用方输入，不能因为演示菜单重进就偷偷创建另一笔购买。
it("passes the caller-owned creation idempotency key", async () => {
  const { runtime, requests } = fixture(
    ["Example", "facebook", "region_example", "", "session", "", "", "", "", "creation_example"],
    ["3", "2", "back", "back"]
  );
  await FULL_API_DEMO_ACTIONS[0].run(runtime);
  expect(requests).toEqual([
    {
      method: "POST",
      path: "/v1/accounts",
      headers: { "Idempotency-Key": "creation_example" },
      body: {
        name: "Example",
        provider: "facebook",
        region: "region_example",
        auth_mode: "session"
      }
    }
  ]);
});
it("preserves safe diagnostic codes but redacts authorization codes", () => {
  const writes: string[] = [];
  writeCliResponse(
    (s) => writes.push(s),
    { method: "GET", path: "/v1/account-operations/op_example" },
    {
      data: { last_error_code: "cleanup_unconfirmed", code: "private_auth_code" },
      error: { code: "invalid_request", numeric_code: "10000" }
    }
  );
  expect(writes.join("\n")).toContain("cleanup_unconfirmed");
  expect(writes.join("\n")).toContain("invalid_request");
  expect(writes.join("\n")).toContain("10000");
  expect(writes.join("\n")).not.toContain("private_auth_code");
});

/** CLI 请求与响应共用日志边界，PIN 和未知授权材料都不能出现在演示记录中。 */
it("redacts import PINs and whole authorization payloads in CLI output", () => {
  const request = {
    method: "POST" as const,
    path: "/v1/accounts/acc_example/auth/session",
    body: { session_url: "https://example.com/session", pin: "private_request_pin" }
  };
  const response = {
    data: {
      auth_status: "awaiting_code",
      runtime_status: "disconnected",
      auth_payload: { pin: "private_response_pin", opaque: "private_material" }
    }
  };
  const before = structuredClone({ request, response });
  const writes: string[] = [];
  writeCliResponse((message) => writes.push(message), request, response);
  const output = writes.join("\n");
  for (const secret of ["private_request_pin", "private_response_pin", "private_material"]) {
    expect(output).not.toContain(secret);
  }
  expect(output).toContain('"auth_payload": "[REDACTED]"');
  expect(output).toContain('"auth_status": "awaiting_code"');
  expect(output).toContain('"runtime_status": "disconnected"');
  expect({ request, response }).toEqual(before);
});

/** 回复目标不能从大整数或省略值推断，必须保留用户确认的一级评论字符串 ID。 */
it("replies to the selected top-level comment with unchanged identifiers and text", async () => {
  const { runtime, requests } = fixture(
    ["acc_example", "9007199254740993", "9007199254740995", " Reply text ", "CONFIRM"],
    ["replyPostComment"]
  );
  await runPublishedApiDemo(runtime);
  expect(requests).toEqual([
    {
      method: "POST",
      path: "/v1/accounts/acc_example/posts/comments/reply",
      body: {
        post_id: "9007199254740993",
        comment_id: "9007199254740995",
        text: " Reply text "
      }
    }
  ]);
});

/** 缺失回复目标时不能退化成不带 comment_id 的写入，也不能继续索要确认。 */
it.each(["", " ", "\t"])(
  "rejects a blank reply comment_id %j before confirmation",
  async (comment_id) => {
    const { runtime, requests } = fixture(
      ["acc_example", "9007199254740993", comment_id, "Reply text"],
      ["replyPostComment"]
    );
    await expect(runPublishedApiDemo(runtime)).rejects.toThrow("comment_id is required");
    expect(requests).toEqual([]);
  }
);

it("does not reply when the confirmation word is rejected", async () => {
  const { runtime, requests } = fixture(
    ["acc_example", "9007199254740993", "9007199254740995", "Reply text", "NO"],
    ["replyPostComment"]
  );
  await runPublishedApiDemo(runtime);
  expect(requests).toEqual([]);
});
