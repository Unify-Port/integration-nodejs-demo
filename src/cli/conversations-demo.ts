import {
  deleteConversationLabel,
  getConversation,
  listConversationLabels,
  listConversationMembers,
  listConversations,
  markConversationRead,
  markConversationUnread,
  muteConversation,
  pinConversation,
  setConversationLabelMembers,
  unmuteConversation,
  unpinConversation,
  upsertConversationLabel
} from "../resources/conversations/api.js";
import type { UnifyPortQuery } from "../core/unifyport-client.js";
import { writeCliResponse, type CliRequestRecorder, type CliWrite } from "./output.js";
import { promptCliField, type CliPromptField } from "./prompt-help.js";
import type { CliSelectChoice, CliSelectRuntime } from "./select-prompt.js";

export type ConversationsDemoPrompt = (label: string) => Promise<string>;

export interface ConversationsDemoRuntime {
  recorder: CliRequestRecorder;
  prompt: ConversationsDemoPrompt;
  select: CliSelectRuntime["select"];
  write: CliWrite;
}

interface ConversationsAction {
  key: string;
  title: string;
  run(runtime: ConversationsDemoRuntime): Promise<void>;
}

const CONVERSATIONS_PROMPT_FIELDS: Record<string, CliPromptField> = {
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
    description: "标签操作类型",
    example: "add",
    emptyHint: ""
  },
  confirm_delete_label: {
    name: "confirm_delete_label",
    required: true,
    type: "confirmation token",
    description: "输入 DELETE 继续删除会话标签",
    example: "DELETE",
    emptyHint: ""
  },
  conversation_id: {
    name: "conversation_id",
    required: true,
    type: "string",
    description: "会话 ID",
    example: "peer_example",
    emptyHint: ""
  },
  conversation_ids: {
    name: "conversation_ids",
    required: true,
    type: "string[]",
    description: "会话 ID 列表，多个值用英文逗号分隔",
    example: "peer_example,peer_other",
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
  duration: {
    name: "duration",
    required: true,
    type: "number",
    description: "静音时长，单位秒，0 表示永久静音",
    example: "86400",
    emptyHint: ""
  },
  label_id: {
    name: "label_id",
    required: false,
    type: "string",
    description: "会话标签 ID",
    example: "label_example",
    emptyHint: "直接回车表示创建新标签"
  },
  limit: {
    name: "limit",
    required: false,
    type: "number",
    description: "分页条数",
    example: "20",
    emptyHint: "直接回车表示不传"
  },
  name: {
    name: "name",
    required: true,
    type: "string",
    description: "标签名称",
    example: "VIP",
    emptyHint: ""
  },
  type: {
    name: "type",
    required: false,
    type: "string",
    description: "会话类型，多个值用英文逗号分隔",
    example: "user,group",
    emptyHint: "直接回车表示不传"
  },
  up_to_message_id: {
    name: "up_to_message_id",
    required: false,
    type: "string",
    description: "标记已读截止消息 ID",
    example: "msg_example",
    emptyHint: "直接回车表示不传"
  }
};

/**
 * 输出会话操作的当前请求响应。
 */
function writeCurrentResponse(runtime: ConversationsDemoRuntime, responseBody: unknown): void {
  writeCliResponse(runtime.write, runtime.recorder.getRequest(), responseBody);
}

/**
 * 按字段名读取会话参数，并在输入前输出该字段的说明。
 */
function promptField(runtime: ConversationsDemoRuntime, name: string): Promise<string> {
  return promptCliField(runtime, CONVERSATIONS_PROMPT_FIELDS[name] as CliPromptField);
}

/**
 * 读取 account_id。
 */
function promptAccountId(runtime: ConversationsDemoRuntime): Promise<string> {
  return promptField(runtime, "account_id");
}

/**
 * 读取 conversation_id。
 */
function promptConversationId(runtime: ConversationsDemoRuntime): Promise<string> {
  return promptField(runtime, "conversation_id");
}

/**
 * 将逗号分隔的 conversation_ids 转换为文档要求的数组字段。
 */
function parseConversationIds(conversation_ids: string): string[] {
  return conversation_ids.split(",").map((conversation_id) => conversation_id.trim());
}

/**
 * 非必填字符串 query 直接回车时不写入请求。
 */
function addOptionalQueryString(query: UnifyPortQuery, field: string, value: string): void {
  if (value !== "") {
    query[field] = value;
  }
}

/**
 * 非必填数字 query 直接回车时不写入请求。
 */
function addOptionalQueryNumber(query: UnifyPortQuery, field: string, value: string): void {
  if (value !== "") {
    query[field] = Number(value);
  }
}

/**
 * 非必填字符串 body 字段直接回车时不写入请求。
 */
function addOptionalBodyString(body: Record<string, string>, field: string, value: string): void {
  if (value !== "") {
    body[field] = value;
  }
}

/**
 * 会话相关的安全演示流程。
 */
const CONVERSATIONS_ACTIONS: ConversationsAction[] = [
  {
    key: "1",
    title: "查询会话列表",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const type = await promptField(runtime, "type");
      const limit = await promptField(runtime, "limit");
      const cursor = await promptField(runtime, "cursor");
      const query: UnifyPortQuery = {};

      addOptionalQueryString(query, "type", type);
      addOptionalQueryNumber(query, "limit", limit);
      addOptionalQueryString(query, "cursor", cursor);

      const responseBody = await listConversations(runtime.recorder.client, account_id, query);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "查询会话详情",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const type = await promptField(runtime, "type");
      const query: UnifyPortQuery = {
        conversation_id
      };

      addOptionalQueryString(query, "type", type);

      const responseBody = await getConversation(runtime.recorder.client, account_id, query);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "查询会话成员",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const type = await promptField(runtime, "type");
      const limit = await promptField(runtime, "limit");
      const cursor = await promptField(runtime, "cursor");
      const query: UnifyPortQuery = {
        conversation_id
      };

      addOptionalQueryString(query, "type", type);
      addOptionalQueryNumber(query, "limit", limit);
      addOptionalQueryString(query, "cursor", cursor);

      const responseBody = await listConversationMembers(
        runtime.recorder.client,
        account_id,
        query
      );

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "标记会话已读",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const up_to_message_id = await promptField(runtime, "up_to_message_id");
      const responseBody = await markConversationRead(runtime.recorder.client, account_id, {
        conversation_id,
        up_to_message_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "标记会话未读",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const responseBody = await markConversationUnread(runtime.recorder.client, account_id, {
        conversation_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "静音会话",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const duration = await promptField(runtime, "duration");
      const responseBody = await muteConversation(runtime.recorder.client, account_id, {
        conversation_id,
        duration: Number(duration)
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "7",
    title: "取消静音会话",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const responseBody = await unmuteConversation(runtime.recorder.client, account_id, {
        conversation_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "8",
    title: "置顶会话",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const responseBody = await pinConversation(runtime.recorder.client, account_id, {
        conversation_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "9",
    title: "取消置顶会话",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const conversation_id = await promptConversationId(runtime);
      const responseBody = await unpinConversation(runtime.recorder.client, account_id, {
        conversation_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "10",
    title: "查询会话标签列表",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const limit = await promptField(runtime, "limit");
      const cursor = await promptField(runtime, "cursor");
      const query: UnifyPortQuery = {};

      addOptionalQueryNumber(query, "limit", limit);
      addOptionalQueryString(query, "cursor", cursor);

      const responseBody = await listConversationLabels(runtime.recorder.client, account_id, query);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "11",
    title: "创建或更新会话标签",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const label_id = await promptField(runtime, "label_id");
      const name = await promptField(runtime, "name");
      const body: Record<string, string> = {
        name
      };

      addOptionalBodyString(body, "label_id", label_id);

      const responseBody = await upsertConversationLabel(runtime.recorder.client, account_id, body);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "12",
    title: "删除会话标签",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const label_id = await promptField(runtime, "label_id");
      const confirm_delete_label = await promptField(runtime, "confirm_delete_label");

      if (confirm_delete_label !== "DELETE") {
        runtime.write("已取消删除会话标签。");
        return;
      }

      const responseBody = await deleteConversationLabel(runtime.recorder.client, account_id, {
        label_id
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "13",
    title: "会话标签操作",
    async run(runtime) {
      const account_id = await promptAccountId(runtime);
      const label_id = await promptField(runtime, "label_id");
      const action = await promptField(runtime, "action");
      const conversation_ids = await promptField(runtime, "conversation_ids");
      const responseBody = await setConversationLabelMembers(runtime.recorder.client, account_id, {
        label_id,
        action,
        conversation_ids: parseConversationIds(conversation_ids)
      });

      writeCurrentResponse(runtime, responseBody);
    }
  }
];

/**
 * 生成会话操作选择项。
 */
export function getConversationsMenuChoices(): CliSelectChoice[] {
  const choices: CliSelectChoice[] = [];

  for (const action of CONVERSATIONS_ACTIONS) {
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
 * 生成会话操作菜单文本，供非交互输出复用。
 */
export function getConversationsMenuText(): string {
  const lines = ["", "请选择会话操作："];

  for (const choice of getConversationsMenuChoices()) {
    lines.push(choice.label);
  }

  return lines.join("\n");
}

/**
 * 根据选择执行一个会话操作。
 */
export async function runConversationsAction(
  runtime: ConversationsDemoRuntime,
  selection: string
): Promise<boolean> {
  if (selection === "back") {
    return false;
  }

  for (const action of CONVERSATIONS_ACTIONS) {
    if (action.key === selection) {
      await action.run(runtime);
      return true;
    }
  }

  runtime.write("未识别的会话流程，请重新选择。");
  return true;
}

/**
 * 启动会话操作二级菜单。
 */
export async function runConversationsDemo(runtime: ConversationsDemoRuntime): Promise<void> {
  let shouldContinue = true;

  while (shouldContinue) {
    const selection = await runtime.select("请选择会话操作", getConversationsMenuChoices());
    shouldContinue = await runConversationsAction(runtime, selection);
  }
}
