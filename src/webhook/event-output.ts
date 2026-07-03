type WebhookWrite = (message: string) => void;

type JsonObject = Record<string, unknown>;

const STANDARD_EVENT_DESCRIPTIONS: Record<string, string> = {
  "message.received": "An inbound message arrived on the account.",
  "message.updated": "A previously delivered message was edited.",
  "message.deleted": "A message was deleted or recalled.",
  "message.read": "A read receipt - the recipient read a message.",
  "message.reaction": "A reaction was added to or removed from a message.",
  "message.delivered": "A message was delivered to the recipient's device.",
  "conversation.updated":
    "A conversation-level setting changed - muted/unmuted, archived, pinned, or marked read.",
  "conversation.deleted": "A conversation was deleted.",
  "conversation.cleared": "A conversation's history was cleared.",
  "conversation.history":
    "Recent WhatsApp history for one conversation was synced after bootstrap or reconnect.",
  "group.updated": "Group metadata changed - name, members, or settings.",
  "group.join_request":
    "Someone asked to join a group with join approval enabled. Push is best-effort - poll List group join requests as the reliable source.",
  "account.status.updated": "The account runtime / connection status changed.",
  "account.started": "The account runtime connected and is ready to send and receive.",
  "account.history.synced":
    "A WhatsApp history-sync batch finished; data.summary gives the delivered conversation and message counts.",
  "account.auth.required": "The account needs (re)authentication - a code, QR scan, or 2FA.",
  "account.auth.succeeded": "Authentication finished and the account is online.",
  "account.auth.failed": "An authentication attempt failed."
};

/**
 * 判断一个值是否为普通 JSON 对象。
 */
function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object") {
    return false;
  }

  if (value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  return true;
}

/**
 * 读取对象中的字符串字段。
 */
function readString(source: JsonObject, key: string): string {
  const value = source[key];

  if (typeof value === "string") {
    return value;
  }

  return "";
}

/**
 * 读取对象中的子对象字段。
 */
function readObject(source: JsonObject, key: string): JsonObject {
  const value = source[key];

  if (isJsonObject(value)) {
    return value;
  }

  return {};
}

/**
 * 读取标准事件说明。
 */
function getEventDescription(type: string): string {
  const description = STANDARD_EVENT_DESCRIPTIONS[type];

  if (description !== undefined) {
    return description;
  }

  return "Unrecognized event type. Inspect Raw Event for details.";
}

/**
 * 将 JSON 值格式化为控制台文本。
 */
function formatJson(value: unknown): string {
  const text = JSON.stringify(value, null, 2);

  if (text === undefined) {
    return "无";
  }

  return text;
}

/**
 * 追加非空字符串字段提示。
 */
function pushStringHint(lines: string[], label: string, value: string): void {
  if (value.length > 0) {
    lines.push(`${label}: ${value}`);
  }
}

/**
 * 从 event.data.event 提取事件动作提示。
 */
function appendEventKindHints(lines: string[], data: JsonObject): void {
  const eventData = readObject(data, "event");

  pushStringHint(lines, "data.event.kind", readString(eventData, "kind"));
}

/**
 * 从 event.data.conversation 提取会话提示。
 */
function appendConversationHints(lines: string[], data: JsonObject): void {
  const conversation = readObject(data, "conversation");
  const conversationId = readString(conversation, "id");

  pushStringHint(lines, "data.conversation.id", conversationId);

  if (conversationId.length > 0) {
    lines.push(`recipient_id: ${conversationId}`);
  }

  pushStringHint(lines, "data.conversation.type", readString(conversation, "type"));
  pushStringHint(lines, "data.conversation.title", readString(conversation, "title"));
}

/**
 * 从 event.data.sender 提取发送方提示。
 */
function appendSenderHints(lines: string[], data: JsonObject): void {
  const sender = readObject(data, "sender");

  pushStringHint(lines, "data.sender.id", readString(sender, "id"));
  pushStringHint(lines, "data.sender.type", readString(sender, "type"));
  pushStringHint(lines, "data.sender.name", readString(sender, "name"));
}

/**
 * 从 event.data.message 提取消息提示。
 */
function appendMessageHints(lines: string[], data: JsonObject): void {
  const message = readObject(data, "message");

  pushStringHint(lines, "data.message.id", readString(message, "id"));
  pushStringHint(lines, "data.message.type", readString(message, "type"));
  pushStringHint(lines, "data.message.text", readString(message, "text"));
  pushStringHint(lines, "data.message.direction", readString(message, "direction"));
  pushStringHint(lines, "data.message.target_message_id", readString(message, "target_message_id"));
}

/**
 * 从账号状态事件中提取认证和 runtime 提示。
 */
function appendAccountStateHints(lines: string[], data: JsonObject): void {
  const account = readObject(data, "account");

  pushStringHint(lines, "data.auth_status", readString(data, "auth_status"));
  pushStringHint(lines, "data.runtime_status", readString(data, "runtime_status"));
  pushStringHint(lines, "data.last_error", readString(data, "last_error"));
  pushStringHint(
    lines,
    "data.account.provider_account_ref",
    readString(account, "provider_account_ref")
  );
}

/**
 * 从历史同步事件中提取统计提示。
 */
function appendSummaryHints(lines: string[], data: JsonObject): void {
  const summary = readObject(data, "summary");
  const conversations = summary.conversations;
  const messages = summary.messages;

  if (typeof conversations === "number") {
    lines.push(`data.summary.conversations: ${String(conversations)}`);
  }

  if (typeof messages === "number") {
    lines.push(`data.summary.messages: ${String(messages)}`);
  }
}

/**
 * 生成 webhook 事件关键字段提示。
 */
function buildWebhookEventHints(data: JsonObject): string[] {
  const lines: string[] = [];

  appendEventKindHints(lines, data);
  appendConversationHints(lines, data);
  appendSenderHints(lines, data);
  appendMessageHints(lines, data);
  appendAccountStateHints(lines, data);
  appendSummaryHints(lines, data);

  return lines;
}

/**
 * 打印控制台分区。
 */
function writeSection(write: WebhookWrite, title: string, lines: string[]): void {
  write(`========== ${title} ==========`);

  if (lines.length === 0) {
    write("无");
    return;
  }

  for (const line of lines) {
    write(line);
  }
}

/**
 * 打印 webhook 事件内容。
 *
 * 所有事件都会先打印标准 envelope，再打印常用 data 字段提示，最后保留原始 JSON，
 * 方便客户演示时同时查看事件类型、账号状态、会话 ID、消息 ID 和完整 payload。
 */
export function writeWebhookEvent(write: WebhookWrite, event: unknown): void {
  let eventRecord: JsonObject = {};

  if (isJsonObject(event)) {
    eventRecord = event;
  }

  const dataValue = eventRecord.data;
  let data: JsonObject = {};

  if (isJsonObject(dataValue)) {
    data = dataValue;
  }

  const type = readString(eventRecord, "type");
  const eventLines: string[] = [];
  const hints = buildWebhookEventHints(data);

  pushStringHint(eventLines, "id", readString(eventRecord, "id"));
  pushStringHint(eventLines, "type", type);
  pushStringHint(eventLines, "description", getEventDescription(type));
  pushStringHint(eventLines, "provider", readString(eventRecord, "provider"));
  pushStringHint(eventLines, "account_id", readString(eventRecord, "account_id"));
  pushStringHint(eventLines, "occurred_at", readString(eventRecord, "occurred_at"));

  writeSection(write, "Webhook Event", eventLines);
  writeSection(write, "Event Hints", hints);
  writeSection(write, "Event Data", [formatJson(dataValue)]);
  writeSection(write, "Raw Event", [formatJson(event)]);
}
