import type { FullApiDemoRuntime } from "./full-api-demo.js";
import { promptCliField } from "./prompt-help.js";
import { writeCliResponse } from "./output.js";
import { getAccountOperation } from "../resources/accounts/api.js";
import {
  createAccountAuthSession,
  submitAccountPasskeyResponse,
  confirmAccountPasskey
} from "../resources/auth/api.js";
import { createContact, getContactMembership } from "../resources/contacts/api.js";
import { requestConversationHistory } from "../resources/conversations/api.js";
import { listPosts, getPost, listPostComments, replyPostComment } from "../resources/posts/api.js";
import { createCall, getActiveCall, hangupCall } from "../resources/calls/api.js";

type Values = Record<string, string>;
type Action = {
  id: string;
  fields: string[];
  write: boolean;
  confirm: string;
  run(runtime: FullApiDemoRuntime, values: Values): Promise<unknown>;
};
/** 新入口只组装已审查字段；POST 读取不作为写入，通话仍由服务端检查 beta 资格。 */
const ACTIONS: Action[] = [
  {
    id: "getAccountOperation",
    fields: ["operation_id"],
    write: false,
    confirm: "",
    run: (r, v) => getAccountOperation(r.recorder.client, v.operation_id)
  },
  {
    id: "createAccountAuthSession",
    fields: ["account_id"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) => createAccountAuthSession(r.recorder.client, v.account_id)
  },
  {
    id: "submitAccountPasskeyResponse",
    fields: ["account_id", "webauthn_response"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) =>
      submitAccountPasskeyResponse(r.recorder.client, v.account_id, {
        webauthn_response: v.webauthn_response
      })
  },
  {
    id: "confirmAccountPasskey",
    fields: ["account_id"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) => confirmAccountPasskey(r.recorder.client, v.account_id)
  },
  {
    id: "createContact",
    fields: ["account_id", "phone_number"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) => createContact(r.recorder.client, v.account_id, { phone_number: v.phone_number })
  },
  {
    id: "getContactMembership",
    fields: ["account_id", "contact_id"],
    write: false,
    confirm: "",
    run: (r, v) =>
      getContactMembership(r.recorder.client, v.account_id, { contact_id: v.contact_id })
  },
  {
    id: "requestConversationHistory",
    fields: ["account_id", "conversation_id", "message_id", "sent_at", "direction"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) =>
      requestConversationHistory(r.recorder.client, v.account_id, {
        conversation_id: v.conversation_id,
        before: { message_id: v.message_id, sent_at: v.sent_at, direction: v.direction }
      })
  },
  {
    id: "listPosts",
    fields: ["account_id"],
    write: false,
    confirm: "",
    run: (r, v) => listPosts(r.recorder.client, v.account_id, {})
  },
  {
    id: "getPost",
    fields: ["account_id", "post_id"],
    write: false,
    confirm: "",
    run: (r, v) => getPost(r.recorder.client, v.account_id, { post_id: v.post_id })
  },
  {
    id: "listPostComments",
    fields: ["account_id", "post_id"],
    write: false,
    confirm: "",
    run: (r, v) => listPostComments(r.recorder.client, v.account_id, { post_id: v.post_id })
  },
  {
    id: "replyPostComment",
    fields: ["account_id", "post_id", "comment_id", "text"],
    write: true,
    confirm: "CONFIRM",
    run: (r, v) =>
      replyPostComment(r.recorder.client, v.account_id, {
        post_id: v.post_id,
        comment_id: v.comment_id,
        text: v.text
      })
  },
  {
    id: "createCall",
    fields: ["account_id", "recipient_id", "media_type"],
    write: true,
    confirm: "CALL",
    run: (r, v) =>
      createCall(r.recorder.client, {
        account_id: v.account_id,
        to: { id: v.recipient_id, type: "user" },
        media_type: v.media_type
      })
  },
  {
    id: "getActiveCall",
    fields: ["account_id"],
    write: false,
    confirm: "",
    run: (r, v) => getActiveCall(r.recorder.client, { account_id: v.account_id })
  },
  {
    id: "hangupCall",
    fields: ["account_id", "call_id"],
    write: true,
    confirm: "HANGUP",
    run: (r, v) => hangupCall(r.recorder.client, v.call_id, { account_id: v.account_id })
  }
];

/** 独立菜单使新增接口可演示，写入仍逐次确认且不自动拨号、轮询或重试。 */
export async function runPublishedApiDemo(runtime: FullApiDemoRuntime): Promise<void> {
  runtime.write(
    "通话为 private beta；授权成功需另查 runtime；历史请求为异步 best effort。敏感链接输出默认脱敏。"
  );
  const id = await runtime.select("选择新增公开接口", [
    ...ACTIONS.map((a) => ({ label: a.id, value: a.id })),
    { label: "返回", value: "back" }
  ]);
  if (id === "back") return;
  const action = ACTIONS.find((a) => a.id === id);
  if (action === undefined) throw new Error("Unknown published API action");
  if (action.id === "replyPostComment") {
    runtime.write("仅回复已确认的一级评论；comment_id 使用接口返回的原始字符串 ID。");
  }
  const values: Values = {};
  for (const name of action.fields) {
    values[name] = await promptCliField(runtime, {
      name,
      required: true,
      type: "string",
      description: "使用对应公开接口字段；ID 与时间原样取自同一资源",
      example: "",
      emptyHint: ""
    });
  }
  /** 回复必须有明确目标，空值不能退化成无 comment_id 的另一种写入。 */
  if (action.id === "replyPostComment" && values.comment_id.trim() === "") {
    throw new Error("comment_id is required for a reply");
  }
  if (action.write) {
    const confirmation = await promptCliField(runtime, {
      name: "confirmation",
      required: true,
      type: "string",
      description: `输入 ${action.confirm} 执行 ${action.id}`,
      example: action.confirm,
      emptyHint: ""
    });
    if (confirmation !== action.confirm) {
      runtime.write("已取消操作。");
      return;
    }
  }
  const response = await action.run(runtime, values);
  writeCliResponse(runtime.write, runtime.recorder.getRequest(), response);
}
