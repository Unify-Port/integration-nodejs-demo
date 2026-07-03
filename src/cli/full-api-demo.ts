import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount
} from "../resources/accounts/api.js";
import {
  createApiKey,
  listApiKeys,
  rotateApiKey,
  updateApiKey
} from "../resources/api-keys/api.js";
import {
  cancelAuth,
  checkQrAuth,
  getAccountAuth,
  importAuthSession,
  startCodeAuth,
  startQrAuth,
  submitAuthCode,
  submitAuthPassword
} from "../resources/auth/api.js";
import {
  blockContact,
  getContact,
  listBlocklist,
  listContacts,
  setContactNote,
  unblockContact
} from "../resources/contacts/api.js";
import {
  createGroup,
  getGroup,
  getGroupInviteCode,
  leaveGroup,
  listGroupJoinRequests,
  listGroups,
  setGroupJoinApprovalMode,
  updateGroupInfo,
  updateGroupJoinRequests,
  updateGroupMembers
} from "../resources/groups/api.js";
import {
  editMessage,
  pinMessage,
  reactMessage,
  revokeMessage,
  sendContactMessage,
  sendMediaMessage,
  sendMentionMessage,
  sendReplyMessage,
  sendTextMessage
} from "../resources/messages/api.js";
import { listProviderRegions } from "../resources/providers/api.js";
import {
  reconnectRuntime,
  refreshRuntime,
  startRuntime,
  stopRuntime
} from "../resources/runtime/api.js";
import type { UnifyPortQuery } from "../core/unifyport-client.js";
import {
  createWebhookEndpoint,
  deactivateWebhookEndpoint,
  deleteWebhookEndpoint,
  getWebhookEndpoint,
  listWebhookEndpoints,
  updateWebhookEndpoint
} from "../resources/webhook-endpoints/api.js";
import { getWorkspace, updateWorkspace } from "../resources/workspace/api.js";
import { runConversationsDemo } from "./conversations-demo.js";
import { writeCliResponse, type CliRequestRecorder, type CliWrite } from "./output.js";
import { promptCliField, type CliPromptField } from "./prompt-help.js";
import type { CliSelectChoice, CliSelectRuntime } from "./select-prompt.js";

export type FullApiDemoPrompt = (label: string) => Promise<string>;

export interface FullApiDemoRuntime {
  recorder: CliRequestRecorder;
  prompt: FullApiDemoPrompt;
  select: CliSelectRuntime["select"];
  write: CliWrite;
}

export interface FullApiDemoAction {
  key: string;
  title: string;
  endpointCount: number;
  run(runtime: FullApiDemoRuntime): Promise<void>;
}

interface FullApiMenuAction {
  key: string;
  title: string;
  endpointCount: number;
  run(runtime: FullApiDemoRuntime): Promise<void>;
}

const FULL_API_PROMPT_FIELDS: Record<string, CliPromptField> = {
  account_id: {
    name: "account_id",
    required: true,
    type: "string",
    description: "账号 ID",
    example: "acc_example",
    emptyHint: ""
  },
  action: {
    name: "action",
    required: true,
    type: "string",
    description: "操作类型",
    example: "add",
    emptyHint: ""
  },
  auth_mode: {
    name: "auth_mode",
    required: false,
    type: "string",
    description: "认证方式",
    example: "code",
    emptyHint: "直接回车表示不传"
  },
  avatar_url: {
    name: "avatar_url",
    required: false,
    type: "string",
    description: "头像图片 URL",
    example: "https://example.com/avatar.jpg",
    emptyHint: "直接回车表示不传"
  },
  capabilities: {
    name: "capabilities",
    required: false,
    type: "string[]",
    description: "账号能力列表，多个值用英文逗号分隔",
    example: "send_message,receive_message",
    emptyHint: "直接回车表示不传"
  },
  code: {
    name: "code",
    required: true,
    type: "string",
    description: "认证验证码",
    example: "123456",
    emptyHint: ""
  },
  confirm_block_contact: {
    name: "confirm_block_contact",
    required: true,
    type: "confirmation token",
    description: "输入 BLOCK 继续拉黑联系人",
    example: "BLOCK",
    emptyHint: ""
  },
  confirm_delete_account: {
    name: "confirm_delete_account",
    required: true,
    type: "confirmation token",
    description: "输入 DELETE 继续删除账号",
    example: "DELETE",
    emptyHint: ""
  },
  confirm_delete_webhook_endpoint: {
    name: "confirm_delete_webhook_endpoint",
    required: true,
    type: "confirmation token",
    description: "输入 DELETE 继续删除 webhook endpoint",
    example: "DELETE",
    emptyHint: ""
  },
  confirm_leave_group: {
    name: "confirm_leave_group",
    required: true,
    type: "confirmation token",
    description: "输入 LEAVE 继续退出群",
    example: "LEAVE",
    emptyHint: ""
  },
  confirm_revoke_message: {
    name: "confirm_revoke_message",
    required: true,
    type: "confirmation token",
    description: "输入 REVOKE 继续撤回消息",
    example: "REVOKE",
    emptyHint: ""
  },
  confirm_rotate_api_key: {
    name: "confirm_rotate_api_key",
    required: true,
    type: "confirmation token",
    description: "输入 ROTATE 继续轮换 API Key",
    example: "ROTATE",
    emptyHint: ""
  },
  confirm_stop_runtime: {
    name: "confirm_stop_runtime",
    required: true,
    type: "confirmation token",
    description: "输入 STOP 继续停止 runtime",
    example: "STOP",
    emptyHint: ""
  },
  contact_id: {
    name: "contact_id",
    required: true,
    type: "string",
    description: "联系人 ID",
    example: "user_example",
    emptyHint: ""
  },
  content: {
    name: "content",
    required: true,
    type: "string",
    description: "编辑后的完整消息文本",
    example: "Corrected message",
    emptyHint: ""
  },
  conversation_id: {
    name: "conversation_id",
    required: true,
    type: "string",
    description: "会话 ID",
    example: "8613912345678@s.whatsapp.net",
    emptyHint: ""
  },
  cursor: {
    name: "cursor",
    required: false,
    type: "string",
    description: "分页游标",
    example: "next_cursor",
    emptyHint: "直接回车表示不传"
  },
  description: {
    name: "description",
    required: false,
    type: "string",
    description: "描述文本",
    example: "Q3 launch coordination",
    emptyHint: "直接回车表示不传"
  },
  duration_seconds: {
    name: "duration_seconds",
    required: false,
    type: "number",
    description: "消息置顶时长，单位秒",
    example: "604800",
    emptyHint: "直接回车表示不传"
  },
  emoji: {
    name: "emoji",
    required: true,
    type: "string",
    description: "消息 reaction 表情",
    example: "👍",
    emptyHint: ""
  },
  enabled: {
    name: "enabled",
    required: true,
    type: "boolean",
    description: "是否启用",
    example: "true",
    emptyHint: ""
  },
  endpoint_id: {
    name: "endpoint_id",
    required: true,
    type: "string",
    description: "Webhook endpoint ID",
    example: "we_example",
    emptyHint: ""
  },
  group_id: {
    name: "group_id",
    required: true,
    type: "string",
    description: "群 ID",
    example: "group_example",
    emptyHint: ""
  },
  key_id: {
    name: "key_id",
    required: true,
    type: "string",
    description: "API Key ID",
    example: "key_example",
    emptyHint: ""
  },
  limit: {
    name: "limit",
    required: false,
    type: "number",
    description: "分页条数",
    example: "50",
    emptyHint: "直接回车表示不传"
  },
  member_id: {
    name: "member_id",
    required: true,
    type: "string",
    description: "群成员 ID",
    example: "member_example",
    emptyHint: ""
  },
  member_ids: {
    name: "member_ids",
    required: true,
    type: "string[]",
    description: "群成员 ID 列表，多个值用英文逗号分隔",
    example: "member_example,member_other",
    emptyHint: ""
  },
  members: {
    name: "members",
    required: false,
    type: "string[]",
    description: "初始群成员列表，多个值用英文逗号分隔",
    example: "8613710881588",
    emptyHint: "直接回车表示不传"
  },
  mentions: {
    name: "mentions",
    required: true,
    type: "JSON array",
    description: "被 mention 成员列表",
    example: '[{"id":"8613912345678@s.whatsapp.net"}]',
    emptyHint: ""
  },
  message_id: {
    name: "message_id",
    required: true,
    type: "string",
    description: "消息 ID",
    example: "3EB0A185AAC596E2BB602C",
    emptyHint: ""
  },
  "message.caption": {
    name: "message.caption",
    required: false,
    type: "string",
    description: "媒体消息说明文字",
    example: "hello media",
    emptyHint: "直接回车表示不传"
  },
  "message.contacts": {
    name: "message.contacts",
    required: true,
    type: "JSON array",
    description: "联系人卡片数组",
    example: '[{"name":"Jane Doe"}]',
    emptyHint: ""
  },
  "message.text": {
    name: "message.text",
    required: true,
    type: "string",
    description: "消息文本",
    example: "Hello from UnifyPort",
    emptyHint: ""
  },
  "message.type": {
    name: "message.type",
    required: true,
    type: "string",
    description: "消息类型",
    example: "document",
    emptyHint: ""
  },
  "message.url": {
    name: "message.url",
    required: true,
    type: "string",
    description: "媒体文件 URL",
    example: "https://example.com/demo.pdf",
    emptyHint: ""
  },
  metadata: {
    name: "metadata",
    required: false,
    type: "JSON object",
    description: "自定义元数据",
    example: '{"env":"production"}',
    emptyHint: "直接回车表示不传"
  },
  name: {
    name: "name",
    required: true,
    type: "string",
    description: "名称",
    example: "WhatsApp Support",
    emptyHint: ""
  },
  note: {
    name: "note",
    required: true,
    type: "string",
    description: "联系人备注",
    example: "VIP customer",
    emptyHint: ""
  },
  password: {
    name: "password",
    required: true,
    type: "string",
    description: "二次认证密码",
    example: "your-password",
    emptyHint: ""
  },
  pinned: {
    name: "pinned",
    required: true,
    type: "boolean",
    description: "true 表示置顶，false 表示取消置顶",
    example: "true",
    emptyHint: ""
  },
  prefix: {
    name: "prefix",
    required: false,
    type: "string",
    description: "API Key 前缀",
    example: "dk_live",
    emptyHint: "直接回车表示不传"
  },
  provider: {
    name: "provider",
    required: true,
    type: "string",
    description: "渠道名称",
    example: "whatsapp",
    emptyHint: ""
  },
  provider_account_ref: {
    name: "provider_account_ref",
    required: false,
    type: "string",
    description: "渠道侧账号标识",
    example: "provider-side-identifier",
    emptyHint: "直接回车表示不传"
  },
  provider_data: {
    name: "provider_data",
    required: false,
    type: "JSON object",
    description: "渠道扩展字段",
    example: '{"parse_mode":"markdown"}',
    emptyHint: "直接回车表示不传"
  },
  q: {
    name: "q",
    required: false,
    type: "string",
    description: "联系人搜索关键词",
    example: "Alice",
    emptyHint: "直接回车表示不传"
  },
  region: {
    name: "region",
    required: true,
    type: "string",
    description: "渠道区域",
    example: "global",
    emptyHint: ""
  },
  reply_token: {
    name: "reply_token",
    required: true,
    type: "string",
    description: "入站消息事件中的回复 token",
    example: "<data.message.reply_token>",
    emptyHint: ""
  },
  retry_policy: {
    name: "retry_policy",
    required: false,
    type: "JSON object",
    description: "Webhook 重试策略",
    example: '{"max_attempts":3}',
    emptyHint: "直接回车表示不传"
  },
  sender_id: {
    name: "sender_id",
    required: false,
    type: "string",
    description: "消息发送者 ID",
    example: "8613912345678@s.whatsapp.net",
    emptyHint: "直接回车表示不传"
  },
  session_url: {
    name: "session_url",
    required: false,
    type: "string",
    description: "认证 session URL",
    example: "https://example.com/account.session",
    emptyHint: "直接回车表示不传"
  },
  signing_secret: {
    name: "signing_secret",
    required: false,
    type: "string",
    description: "Webhook 签名密钥",
    example: "secret_1",
    emptyHint: "直接回车表示不传"
  },
  status: {
    name: "status",
    required: false,
    type: "string",
    description: "状态",
    example: "active",
    emptyHint: "直接回车表示不传"
  },
  subscribed_events: {
    name: "subscribed_events",
    required: false,
    type: "string[]",
    description: "订阅事件列表，多个值用英文逗号分隔",
    example: "message.received,message.status.updated",
    emptyHint: "直接回车表示不传"
  },
  "to.id": {
    name: "to.id",
    required: true,
    type: "string",
    description: "收件人 ID",
    example: "user_example",
    emptyHint: ""
  },
  "to.type": {
    name: "to.type",
    required: true,
    type: "string",
    description: "收件人类型",
    example: "user",
    emptyHint: ""
  },
  updated_since: {
    name: "updated_since",
    required: false,
    type: "string",
    description: "增量同步起始时间，RFC3339 格式",
    example: "2026-05-13T10:00:00Z",
    emptyHint: "直接回车表示不传"
  },
  url: {
    name: "url",
    required: true,
    type: "string",
    description: "URL 地址",
    example: "https://example.com/webhook",
    emptyHint: ""
  }
};

/**
 * 输出当前请求和响应，保证客户演示时能看到真实接口。
 */
function writeCurrentResponse(runtime: FullApiDemoRuntime, responseBody: unknown): void {
  writeCliResponse(runtime.write, runtime.recorder.getRequest(), responseBody);
}

/**
 * 按字段名读取参数，并在输入前输出该字段的说明。
 */
function promptField(runtime: FullApiDemoRuntime, name: string): Promise<string> {
  return promptCliField(runtime, FULL_API_PROMPT_FIELDS[name] as CliPromptField);
}

/**
 * 读取账号 ID，多个资源菜单共用同一个字段名。
 */
function promptAccountId(runtime: FullApiDemoRuntime): Promise<string> {
  return promptField(runtime, "account_id");
}

/**
 * 读取逗号分隔列表，映射为官方文档里的数组字段。
 */
function parseCommaList(value: string): string[] {
  return value.split(",").map((item) => item.trim());
}

/**
 * 读取布尔值字段，输入 true 时为 true，其他输入按 false 传递。
 */
function parseBoolean(value: string): boolean {
  return value === "true";
}

/**
 * 非必填 query 字符串为空时不进入请求。
 */
function addOptionalQueryString(query: UnifyPortQuery, field: string, value: string): void {
  if (value !== "") {
    query[field] = value;
  }
}

/**
 * 非必填 query 数字为空时不进入请求。
 */
function addOptionalQueryNumber(query: UnifyPortQuery, field: string, value: string): void {
  if (value !== "") {
    query[field] = Number(value);
  }
}

/**
 * 非必填 body 字符串为空时不进入请求。
 */
function addOptionalBodyString(body: Record<string, unknown>, field: string, value: string): void {
  if (value !== "") {
    body[field] = value;
  }
}

/**
 * 非必填 body 数字为空时不进入请求。
 */
function addOptionalBodyNumber(body: Record<string, unknown>, field: string, value: string): void {
  if (value !== "") {
    body[field] = Number(value);
  }
}

/**
 * 非必填 body 数组为空时不进入请求。
 */
function addOptionalBodyList(body: Record<string, unknown>, field: string, value: string): void {
  if (value !== "") {
    body[field] = parseCommaList(value);
  }
}

/**
 * 非必填 body JSON 为空时不进入请求。
 */
function addOptionalBodyJson(body: Record<string, unknown>, field: string, value: string): void {
  if (value !== "") {
    body[field] = JSON.parse(value) as unknown;
  }
}

/**
 * 生成全接口分组的上下键选择项。
 */
function getMenuChoices(actions: FullApiMenuAction[]): CliSelectChoice[] {
  const choices: CliSelectChoice[] = [];

  for (const action of actions) {
    choices.push({
      label: action.title,
      value: action.key
    });
  }

  choices.push({
    label: "返回上级菜单",
    value: "back"
  });

  return choices;
}

/**
 * 执行资源分组菜单。
 */
async function runActionMenu(
  runtime: FullApiDemoRuntime,
  title: string,
  promptLabel: string,
  actions: FullApiMenuAction[]
): Promise<void> {
  let shouldContinue = true;

  while (shouldContinue) {
    const selection = await runtime.select(promptLabel, getMenuChoices(actions));

    if (selection === "back") {
      shouldContinue = false;
    } else {
      let handled = false;

      for (const action of actions) {
        if (action.key === selection) {
          await action.run(runtime);
          handled = true;
        }
      }

      if (handled === false) {
        runtime.write(`未识别的 ${title} 接口，请重新选择。`);
      }
    }
  }
}

/**
 * 高风险动作未输入指定确认词时取消执行。
 */
async function confirmAction(
  runtime: FullApiDemoRuntime,
  label: string,
  expected: string,
  cancelMessage: string
): Promise<boolean> {
  const confirmation = await promptField(runtime, label);

  if (confirmation === expected) {
    return true;
  }

  runtime.write(cancelMessage);
  return false;
}

/**
 * 读取官方消息发送接口的 to 对象。
 */
async function promptMessageTo(runtime: FullApiDemoRuntime): Promise<Record<string, string>> {
  const type = await promptField(runtime, "to.type");
  const id = await promptField(runtime, "to.id");

  return {
    type,
    id
  };
}

/**
 * 读取账号创建和更新接口共享的可选字段。
 */
async function promptAccountBodyFields(
  runtime: FullApiDemoRuntime,
  body: Record<string, unknown>
): Promise<void> {
  const status = await promptField(runtime, "status");
  const auth_mode = await promptField(runtime, "auth_mode");
  const capabilities = await promptField(runtime, "capabilities");
  const provider_data = await promptField(runtime, "provider_data");
  const metadata = await promptField(runtime, "metadata");
  const provider_account_ref = await promptField(runtime, "provider_account_ref");

  addOptionalBodyString(body, "status", status);
  addOptionalBodyString(body, "auth_mode", auth_mode);
  addOptionalBodyList(body, "capabilities", capabilities);
  addOptionalBodyJson(body, "provider_data", provider_data);
  addOptionalBodyJson(body, "metadata", metadata);
  addOptionalBodyString(body, "provider_account_ref", provider_account_ref);
}

const WORKSPACE_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "Get current workspace",
    endpointCount: 1,
    async run(runtime) {
      const responseBody = await getWorkspace(runtime.recorder.client);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Update current workspace",
    endpointCount: 1,
    async run(runtime) {
      const name = await promptField(runtime, "name");
      const status = await promptField(runtime, "status");
      const metadata = await promptField(runtime, "metadata");
      const body: Record<string, unknown> = {};

      addOptionalBodyString(body, "name", name);
      addOptionalBodyString(body, "status", status);
      addOptionalBodyJson(body, "metadata", metadata);

      const responseBody = await updateWorkspace(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const PROVIDER_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List provider regions",
    endpointCount: 1,
    async run(runtime) {
      const provider = await promptField(runtime, "provider");
      const responseBody = await listProviderRegions(runtime.recorder.client, provider);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const ACCOUNT_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List accounts",
    endpointCount: 1,
    async run(runtime) {
      const responseBody = await listAccounts(runtime.recorder.client);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Create account",
    endpointCount: 1,
    async run(runtime) {
      const name = await promptField(runtime, "name");
      const provider = await promptField(runtime, "provider");
      const region = await promptField(runtime, "region");
      const body: Record<string, unknown> = {
        name,
        provider,
        region
      };

      await promptAccountBodyFields(runtime, body);

      const responseBody = await createAccount(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Get account",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await getAccount(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Update account",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const name = await promptField(runtime, "name");
      const provider = await promptField(runtime, "provider");
      const region = await promptField(runtime, "region");
      const body: Record<string, unknown> = {};

      addOptionalBodyString(body, "name", name);
      addOptionalBodyString(body, "provider", provider);
      addOptionalBodyString(body, "region", region);
      await promptAccountBodyFields(runtime, body);

      const responseBody = await updateAccount(runtime.recorder.client, account_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Delete account",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const confirmed = await confirmAction(
        runtime,
        "confirm_delete_account",
        "DELETE",
        "已取消删除账号。"
      );

      if (confirmed === false) {
        return;
      }

      const responseBody = await deleteAccount(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const AUTH_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "Get authentication state",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await getAccountAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Start code authentication",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await startCodeAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Submit verification code",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const code = await promptField(runtime, "code");
      const responseBody = await submitAuthCode(runtime.recorder.client, account_id, {
        code
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Start QR authentication",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await startQrAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Check QR authentication",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await checkQrAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "Submit two-factor password",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const password = await promptField(runtime, "password");
      const responseBody = await submitAuthPassword(runtime.recorder.client, account_id, {
        password
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "7",
    title: "Import authentication session",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const session_url = await promptField(runtime, "session_url");
      const body: Record<string, unknown> = {};

      addOptionalBodyString(body, "session_url", session_url);

      const responseBody = await importAuthSession(runtime.recorder.client, account_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "8",
    title: "Cancel authentication",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await cancelAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const RUNTIME_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "Refresh runtime state",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await refreshRuntime(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Start runtime",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await startRuntime(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Stop runtime",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const confirmed = await confirmAction(
        runtime,
        "confirm_stop_runtime",
        "STOP",
        "已取消停止 runtime。"
      );

      if (confirmed === false) {
        return;
      }

      const responseBody = await stopRuntime(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Reconnect runtime",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await reconnectRuntime(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const MESSAGE_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "Send text message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const to = await promptMessageTo(runtime);
      const text = await promptField(runtime, "message.text");
      const provider_data = await promptField(runtime, "provider_data");
      const body: Record<string, unknown> = {
        account_id,
        to,
        message: {
          type: "text",
          text
        }
      };

      addOptionalBodyJson(body, "provider_data", provider_data);

      const responseBody = await sendTextMessage(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Send media message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const to = await promptMessageTo(runtime);
      const type = await promptField(runtime, "message.type");
      const url = await promptField(runtime, "message.url");
      const caption = await promptField(runtime, "message.caption");
      const message: Record<string, unknown> = {
        type,
        url
      };

      addOptionalBodyString(message, "caption", caption);

      const responseBody = await sendMediaMessage(runtime.recorder.client, {
        account_id,
        to,
        message
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Send contact message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const to = await promptMessageTo(runtime);
      const contacts = await promptField(runtime, "message.contacts");
      const responseBody = await sendContactMessage(runtime.recorder.client, {
        account_id,
        to,
        message: {
          type: "contact",
          contacts: JSON.parse(contacts) as unknown
        }
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Reply to a message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const to = await promptMessageTo(runtime);
      const text = await promptField(runtime, "message.text");
      const reply_token = await promptField(runtime, "reply_token");
      const responseBody = await sendReplyMessage(runtime.recorder.client, {
        account_id,
        to,
        message: {
          type: "text",
          text
        },
        reply_to: {
          reply_token
        }
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Mention members in a group message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const to = await promptMessageTo(runtime);
      const text = await promptField(runtime, "message.text");
      const mentions = await promptField(runtime, "mentions");
      const responseBody = await sendMentionMessage(runtime.recorder.client, {
        account_id,
        to,
        message: {
          type: "text",
          text
        },
        mentions: JSON.parse(mentions) as unknown
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "Pin / unpin message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptField(runtime, "conversation_id");
      const message_id = await promptField(runtime, "message_id");
      const pinned = await promptField(runtime, "pinned");
      const duration_seconds = await promptField(runtime, "duration_seconds");
      const sender_id = await promptField(runtime, "sender_id");
      const body: Record<string, unknown> = {
        account_id,
        conversation_id,
        message_id,
        pinned: parseBoolean(pinned)
      };

      addOptionalBodyNumber(body, "duration_seconds", duration_seconds);
      addOptionalBodyString(body, "sender_id", sender_id);

      const responseBody = await pinMessage(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "7",
    title: "Revoke message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptField(runtime, "conversation_id");
      const message_id = await promptField(runtime, "message_id");
      const sender_id = await promptField(runtime, "sender_id");
      const confirmed = await confirmAction(
        runtime,
        "confirm_revoke_message",
        "REVOKE",
        "已取消撤回消息。"
      );

      if (confirmed === false) {
        return;
      }

      const body: Record<string, unknown> = {
        account_id,
        conversation_id,
        message_id
      };

      addOptionalBodyString(body, "sender_id", sender_id);

      const responseBody = await revokeMessage(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "8",
    title: "React to message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptField(runtime, "conversation_id");
      const message_id = await promptField(runtime, "message_id");
      const sender_id = await promptField(runtime, "sender_id");
      const emoji = await promptField(runtime, "emoji");
      const body: Record<string, unknown> = {
        account_id,
        conversation_id,
        message_id,
        emoji
      };

      addOptionalBodyString(body, "sender_id", sender_id);

      const responseBody = await reactMessage(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "9",
    title: "Edit message",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptField(runtime, "conversation_id");
      const message_id = await promptField(runtime, "message_id");
      const content = await promptField(runtime, "content");
      const responseBody = await editMessage(runtime.recorder.client, {
        account_id,
        conversation_id,
        message_id,
        content
      });

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const CONTACT_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List contacts",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const q = await promptField(runtime, "q");
      const updated_since = await promptField(runtime, "updated_since");
      const limit = await promptField(runtime, "limit");
      const cursor = await promptField(runtime, "cursor");
      const query: UnifyPortQuery = {};

      addOptionalQueryString(query, "q", q);
      addOptionalQueryString(query, "updated_since", updated_since);
      addOptionalQueryNumber(query, "limit", limit);
      addOptionalQueryString(query, "cursor", cursor);

      const responseBody = await listContacts(runtime.recorder.client, account_id, query);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Get contact",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const contact_id = await promptField(runtime, "contact_id");
      const responseBody = await getContact(runtime.recorder.client, account_id, {
        contact_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Block contact",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const contact_id = await promptField(runtime, "contact_id");
      const confirmed = await confirmAction(
        runtime,
        "confirm_block_contact",
        "BLOCK",
        "已取消拉黑联系人。"
      );

      if (confirmed === false) {
        return;
      }

      const responseBody = await blockContact(runtime.recorder.client, account_id, {
        contact_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Unblock contact",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const contact_id = await promptField(runtime, "contact_id");
      const responseBody = await unblockContact(runtime.recorder.client, account_id, {
        contact_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Get blocklist",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const responseBody = await listBlocklist(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "Set contact note",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const contact_id = await promptField(runtime, "contact_id");
      const note = await promptField(runtime, "note");
      const responseBody = await setContactNote(runtime.recorder.client, account_id, {
        contact_id,
        note
      });

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const GROUP_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List groups",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const limit = await promptField(runtime, "limit");
      const cursor = await promptField(runtime, "cursor");
      const query: UnifyPortQuery = {};

      addOptionalQueryNumber(query, "limit", limit);
      addOptionalQueryString(query, "cursor", cursor);

      const responseBody = await listGroups(runtime.recorder.client, account_id, query);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Get group",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const responseBody = await getGroup(runtime.recorder.client, account_id, {
        group_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Create group",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const name = await promptField(runtime, "name");
      const members = await promptField(runtime, "members");
      const body: Record<string, unknown> = {
        name
      };

      addOptionalBodyList(body, "members", members);

      const responseBody = await createGroup(runtime.recorder.client, account_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Leave group",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const confirmed = await confirmAction(
        runtime,
        "confirm_leave_group",
        "LEAVE",
        "已取消退出群。"
      );

      if (confirmed === false) {
        return;
      }

      const responseBody = await leaveGroup(runtime.recorder.client, account_id, {
        group_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Manage group members",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const action = await promptField(runtime, "action");
      const member_id = await promptField(runtime, "member_id");
      const responseBody = await updateGroupMembers(runtime.recorder.client, account_id, {
        group_id,
        action,
        member_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "Update group info",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const name = await promptField(runtime, "name");
      const description = await promptField(runtime, "description");
      const avatar_url = await promptField(runtime, "avatar_url");
      const body: Record<string, unknown> = {
        group_id
      };

      addOptionalBodyString(body, "name", name);
      addOptionalBodyString(body, "description", description);
      addOptionalBodyString(body, "avatar_url", avatar_url);

      const responseBody = await updateGroupInfo(runtime.recorder.client, account_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "7",
    title: "List group join requests",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const responseBody = await listGroupJoinRequests(runtime.recorder.client, account_id, {
        group_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "8",
    title: "Approve / reject join requests",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const action = await promptField(runtime, "action");
      const member_ids = await promptField(runtime, "member_ids");
      const responseBody = await updateGroupJoinRequests(runtime.recorder.client, account_id, {
        group_id,
        action,
        member_ids: parseCommaList(member_ids)
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "9",
    title: "Set group join approval mode",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const enabled = await promptField(runtime, "enabled");
      const responseBody = await setGroupJoinApprovalMode(runtime.recorder.client, account_id, {
        group_id,
        enabled: parseBoolean(enabled)
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "10",
    title: "Get group invite link",
    endpointCount: 1,
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const group_id = await promptField(runtime, "group_id");
      const responseBody = await getGroupInviteCode(runtime.recorder.client, account_id, {
        group_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const API_KEY_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List API keys",
    endpointCount: 1,
    async run(runtime) {
      const responseBody = await listApiKeys(runtime.recorder.client);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Create API key",
    endpointCount: 1,
    async run(runtime) {
      const name = await promptField(runtime, "name");
      const prefix = await promptField(runtime, "prefix");
      const body: Record<string, unknown> = {
        name
      };

      addOptionalBodyString(body, "prefix", prefix);

      const responseBody = await createApiKey(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Update API key status",
    endpointCount: 1,
    async run(runtime) {
      const key_id = await promptField(runtime, "key_id");
      const status = await promptField(runtime, "status");
      const responseBody = await updateApiKey(runtime.recorder.client, key_id, {
        status
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Rotate API key",
    endpointCount: 1,
    async run(runtime) {
      const key_id = await promptField(runtime, "key_id");
      const confirmed = await confirmAction(
        runtime,
        "confirm_rotate_api_key",
        "ROTATE",
        "已取消轮换 API Key。"
      );

      if (confirmed === false) {
        return;
      }

      const name = await promptField(runtime, "name");
      const prefix = await promptField(runtime, "prefix");
      const body: Record<string, unknown> = {};

      addOptionalBodyString(body, "name", name);
      addOptionalBodyString(body, "prefix", prefix);

      const responseBody = await rotateApiKey(runtime.recorder.client, key_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

const WEBHOOK_ENDPOINT_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "List webhook endpoints",
    endpointCount: 1,
    async run(runtime) {
      const responseBody = await listWebhookEndpoints(runtime.recorder.client);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "Create webhook endpoint",
    endpointCount: 1,
    async run(runtime) {
      const url = await promptField(runtime, "url");
      const status = await promptField(runtime, "status");
      const subscribed_events = await promptField(runtime, "subscribed_events");
      const signing_secret = await promptField(runtime, "signing_secret");
      const retry_policy = await promptField(runtime, "retry_policy");
      const body: Record<string, unknown> = {
        url
      };

      addOptionalBodyString(body, "status", status);
      addOptionalBodyList(body, "subscribed_events", subscribed_events);
      addOptionalBodyString(body, "signing_secret", signing_secret);
      addOptionalBodyJson(body, "retry_policy", retry_policy);

      const responseBody = await createWebhookEndpoint(runtime.recorder.client, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "Get webhook endpoint",
    endpointCount: 1,
    async run(runtime) {
      const endpoint_id = await promptField(runtime, "endpoint_id");
      const responseBody = await getWebhookEndpoint(runtime.recorder.client, endpoint_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "Update webhook endpoint",
    endpointCount: 1,
    async run(runtime) {
      const endpoint_id = await promptField(runtime, "endpoint_id");
      const url = await promptField(runtime, "url");
      const status = await promptField(runtime, "status");
      const subscribed_events = await promptField(runtime, "subscribed_events");
      const signing_secret = await promptField(runtime, "signing_secret");
      const retry_policy = await promptField(runtime, "retry_policy");
      const body: Record<string, unknown> = {};

      addOptionalBodyString(body, "url", url);
      addOptionalBodyString(body, "status", status);
      addOptionalBodyList(body, "subscribed_events", subscribed_events);
      addOptionalBodyString(body, "signing_secret", signing_secret);
      addOptionalBodyJson(body, "retry_policy", retry_policy);

      const responseBody = await updateWebhookEndpoint(runtime.recorder.client, endpoint_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "Deactivate webhook endpoint",
    endpointCount: 1,
    async run(runtime) {
      const endpoint_id = await promptField(runtime, "endpoint_id");
      const responseBody = await deactivateWebhookEndpoint(runtime.recorder.client, endpoint_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "Delete webhook endpoint",
    endpointCount: 1,
    async run(runtime) {
      const endpoint_id = await promptField(runtime, "endpoint_id");
      const confirmed = await confirmAction(
        runtime,
        "confirm_delete_webhook_endpoint",
        "DELETE",
        "已取消删除 webhook endpoint。"
      );

      if (confirmed === false) {
        return;
      }

      const responseBody = await deleteWebhookEndpoint(runtime.recorder.client, endpoint_id);

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

/**
 * 全接口分组的二级菜单入口，避免和推荐流程混在主菜单第一层。
 */
const FULL_API_RESOURCE_ACTIONS: FullApiMenuAction[] = [
  {
    key: "1",
    title: "Workspace",
    endpointCount: 2,
    async run(runtime) {
      await runActionMenu(runtime, "Workspace", "请选择 Workspace 接口", WORKSPACE_ACTIONS);
    }
  },
  {
    key: "2",
    title: "Providers",
    endpointCount: 1,
    async run(runtime) {
      await runActionMenu(runtime, "Providers", "请选择 Providers 接口", PROVIDER_ACTIONS);
    }
  },
  {
    key: "3",
    title: "Accounts",
    endpointCount: 5,
    async run(runtime) {
      await runActionMenu(runtime, "Accounts", "请选择 Accounts 接口", ACCOUNT_ACTIONS);
    }
  },
  {
    key: "4",
    title: "Authentication",
    endpointCount: 8,
    async run(runtime) {
      await runActionMenu(runtime, "Authentication", "请选择 Authentication 接口", AUTH_ACTIONS);
    }
  },
  {
    key: "5",
    title: "Runtime",
    endpointCount: 4,
    async run(runtime) {
      await runActionMenu(runtime, "Runtime", "请选择 Runtime 接口", RUNTIME_ACTIONS);
    }
  },
  {
    key: "6",
    title: "Conversations",
    endpointCount: 13,
    async run(runtime) {
      await runConversationsDemo(runtime);
    }
  },
  {
    key: "7",
    title: "Messages",
    endpointCount: 9,
    async run(runtime) {
      await runActionMenu(runtime, "Messages", "请选择 Messages 接口", MESSAGE_ACTIONS);
    }
  },
  {
    key: "8",
    title: "Contacts",
    endpointCount: 6,
    async run(runtime) {
      await runActionMenu(runtime, "Contacts", "请选择 Contacts 接口", CONTACT_ACTIONS);
    }
  },
  {
    key: "9",
    title: "Groups",
    endpointCount: 10,
    async run(runtime) {
      await runActionMenu(runtime, "Groups", "请选择 Groups 接口", GROUP_ACTIONS);
    }
  },
  {
    key: "10",
    title: "API Keys",
    endpointCount: 4,
    async run(runtime) {
      await runActionMenu(runtime, "API Keys", "请选择 API Keys 接口", API_KEY_ACTIONS);
    }
  },
  {
    key: "11",
    title: "Webhook Endpoints",
    endpointCount: 6,
    async run(runtime) {
      await runActionMenu(
        runtime,
        "Webhook Endpoints",
        "请选择 Webhook Endpoints 接口",
        WEBHOOK_ENDPOINT_ACTIONS
      );
    }
  }
];

/**
 * 统计直接接口入口数量，用于和官方文档 endpoint 总数对齐。
 */
export function getFullApiDemoActionCount(): number {
  let total = 0;

  for (const action of FULL_API_RESOURCE_ACTIONS) {
    total += action.endpointCount;
  }

  return total;
}

export const FULL_API_DEMO_ACTIONS: FullApiDemoAction[] = [
  {
    key: "full_api",
    title: "全接口分组",
    endpointCount: 68,
    async run(runtime) {
      await runActionMenu(runtime, "全接口分组", "请选择全接口分组", FULL_API_RESOURCE_ACTIONS);
    }
  }
];
