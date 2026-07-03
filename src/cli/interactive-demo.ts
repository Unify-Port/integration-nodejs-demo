import {
  createWhatsAppCodeAccount,
  listWhatsAppRegions,
  sendWhatsAppTextMessage
} from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";
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
import { getAccount, listAccounts } from "../resources/accounts/api.js";
import {
  reconnectRuntime,
  refreshRuntime,
  startRuntime,
  stopRuntime
} from "../resources/runtime/api.js";
import { createWebhookEndpoint } from "../resources/webhook-endpoints/api.js";
import { FULL_API_DEMO_ACTIONS } from "./full-api-demo.js";
import {
  createCliRequestRecorder,
  writeCliResponse,
  type CliRequestRecorder,
  type CliWrite
} from "./output.js";
import { promptCliField, type CliPromptField } from "./prompt-help.js";
import {
  createInquirerPrompt,
  createInquirerSelect,
  isPromptExit,
  type CliSelectChoice,
  type CliSelectRuntime
} from "./select-prompt.js";
import { selectSupportedChannel } from "./supported-channels.js";

export type DemoPrompt = (label: string) => Promise<string>;

export interface InteractiveDemoRuntime {
  recorder: CliRequestRecorder;
  prompt: DemoPrompt;
  select: CliSelectRuntime["select"];
  write: CliWrite;
}

interface DemoAction {
  key: string;
  title: string;
  run(runtime: InteractiveDemoRuntime): Promise<void>;
}

const DEMO_PROMPT_FIELDS: Record<string, CliPromptField> = {
  account_id: {
    name: "account_id",
    required: true,
    type: "string",
    description: "账号 ID",
    example: "acc_example",
    emptyHint: ""
  },
  confirm_stop_runtime: {
    name: "confirm_stop_runtime",
    required: true,
    type: "string",
    description: "停止 runtime 前输入 STOP 确认",
    example: "STOP",
    emptyHint: ""
  },
  code: {
    name: "code",
    required: true,
    type: "string",
    description: "渠道验证码或认证码",
    example: "123456",
    emptyHint: ""
  },
  name: {
    name: "name",
    required: true,
    type: "string",
    description: "账号名称",
    example: "WhatsApp Support",
    emptyHint: ""
  },
  phone: {
    name: "phone",
    required: true,
    type: "string",
    description: "WhatsApp 手机号，使用国际区号格式",
    example: "8613800138000",
    emptyHint: ""
  },
  password: {
    name: "password",
    required: true,
    type: "string",
    description: "渠道二次认证密码",
    example: "your-two-factor-password",
    emptyHint: ""
  },
  recipient_id: {
    name: "recipient_id",
    required: true,
    type: "string",
    description: "消息接收方 ID，通常来自 webhook 收到的会话 ID",
    example: "8613912345678@s.whatsapp.net",
    emptyHint: ""
  },
  region: {
    name: "region",
    required: true,
    type: "string",
    description: "渠道区域",
    example: "global",
    emptyHint: ""
  },
  signing_secret: {
    name: "signing_secret",
    required: true,
    type: "string",
    description: "Webhook 签名密钥",
    example: "secret_1",
    emptyHint: ""
  },
  session_url: {
    name: "session_url",
    required: true,
    type: "string",
    description: "已有渠道登录 session 地址",
    example: "https://example.com/account.session",
    emptyHint: ""
  },
  text: {
    name: "text",
    required: true,
    type: "string",
    description: "文本消息内容",
    example: "Hello from UnifyPort",
    emptyHint: ""
  },
  url: {
    name: "url",
    required: true,
    type: "string",
    description: "Webhook 接收 URL",
    example: "https://example.com/webhook",
    emptyHint: ""
  }
};

/**
 * 输出当前请求响应。
 */
function writeCurrentResponse(runtime: InteractiveDemoRuntime, responseBody: unknown): void {
  writeCliResponse(runtime.write, runtime.recorder.getRequest(), responseBody);
}

/**
 * 按字段名读取快捷入口参数，并在输入前输出该字段的说明。
 */
function promptField(runtime: InteractiveDemoRuntime, name: string): Promise<string> {
  return promptCliField(runtime, DEMO_PROMPT_FIELDS[name] as CliPromptField);
}

/**
 * 生成菜单的上下键选择项。
 */
function getActionChoices(actions: DemoAction[], backLabel: string): CliSelectChoice[] {
  const choices: CliSelectChoice[] = [];

  for (const action of actions) {
    choices.push({
      label: action.title,
      value: action.key
    });
  }

  choices.push({
    label: backLabel,
    value: "back"
  });

  return choices;
}

/**
 * 执行客户演示二级菜单。
 */
async function runActionMenu(
  runtime: InteractiveDemoRuntime,
  label: string,
  actions: DemoAction[]
): Promise<void> {
  let shouldContinue = true;

  while (shouldContinue) {
    const selection = await runtime.select(label, getActionChoices(actions, "返回上级菜单"));

    if (selection === "back") {
      shouldContinue = false;
    } else {
      for (const action of actions) {
        if (action.key === selection) {
          await action.run(runtime);
        }
      }
    }
  }
}

/**
 * 查询当前 workspace。
 */
async function runWorkspaceCheck(runtime: InteractiveDemoRuntime): Promise<void> {
  const responseBody = await runtime.recorder.client.request({
    method: "GET",
    path: "/v1/workspace"
  });

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 查询账号列表。
 */
async function runAccountList(runtime: InteractiveDemoRuntime): Promise<void> {
  const responseBody = await listAccounts(runtime.recorder.client);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 查询已选择渠道的可用区域。
 */
async function runChannelRegions(runtime: InteractiveDemoRuntime): Promise<void> {
  const channel = await selectSupportedChannel(runtime);

  if (channel === "back") {
    return;
  }

  if (channel === "whatsapp") {
    const responseBody = await listWhatsAppRegions(runtime.recorder.client);

    writeCurrentResponse(runtime, responseBody);
  }
}

/**
 * 创建已选择渠道的账号。
 */
async function runCreateAccount(runtime: InteractiveDemoRuntime): Promise<void> {
  const channel = await selectSupportedChannel(runtime);

  if (channel === "back") {
    return;
  }

  if (channel === "whatsapp") {
    const name = await promptField(runtime, "name");
    const region = await promptField(runtime, "region");
    const phone = await promptField(runtime, "phone");
    const responseBody = await createWhatsAppCodeAccount(runtime.recorder.client, {
      name,
      region,
      phone
    });

    writeCurrentResponse(runtime, responseBody);
  }
}

/**
 * 查询账号详情。
 */
async function runGetAccount(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await getAccount(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 启动验证码或手机号配对认证。
 */
async function runStartAuth(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await startCodeAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 查询指定账号授权状态。
 */
async function writeAuthStateForAccount(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const responseBody = await getAccountAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 查询账号授权状态。
 */
async function runAuthState(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");

  await writeAuthStateForAccount(runtime, account_id);
}

/**
 * 提交指定账号验证码。
 */
async function submitCodeForAccount(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const code = await promptField(runtime, "code");
  const responseBody = await submitAuthCode(runtime.recorder.client, account_id, {
    code
  });

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 提交指定账号二次认证密码。
 */
async function submitPasswordForAccount(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const password = await promptField(runtime, "password");
  const responseBody = await submitAuthPassword(runtime.recorder.client, account_id, {
    password
  });

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 执行验证码或手机号配对认证方式。
 */
async function runCodeAuthMethod(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const responseBody = await startCodeAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
  await writeAuthStateForAccount(runtime, account_id);
  await runAuthNextStepMenu(runtime, account_id);
}

/**
 * 执行二维码认证方式。
 */
async function runQrAuthMethod(runtime: InteractiveDemoRuntime, account_id: string): Promise<void> {
  const responseBody = await startQrAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
  await writeAuthStateForAccount(runtime, account_id);
  await runAuthQrNextStepMenu(runtime, account_id);
}

/**
 * 执行 session 导入认证方式。
 */
async function runSessionAuthMethod(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const session_url = await promptField(runtime, "session_url");
  const responseBody = await importAuthSession(runtime.recorder.client, account_id, {
    session_url
  });

  writeCurrentResponse(runtime, responseBody);
  await writeAuthStateForAccount(runtime, account_id);
}

/**
 * 执行认证后的验证码或密码补充步骤。
 */
async function runAuthNextStepMenu(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  let shouldContinue = true;

  while (shouldContinue) {
    const selection = await runtime.select("请选择认证后的下一步", [
      {
        label: "提交验证码",
        value: "auth_next_code"
      },
      {
        label: "提交二次认证密码",
        value: "auth_next_password"
      },
      {
        label: "跳过后续操作",
        value: "auth_next_skip"
      }
    ]);

    if (selection === "auth_next_code") {
      await submitCodeForAccount(runtime, account_id);
      await writeAuthStateForAccount(runtime, account_id);
    }

    if (selection === "auth_next_password") {
      await submitPasswordForAccount(runtime, account_id);
      await writeAuthStateForAccount(runtime, account_id);
    }

    if (selection === "auth_next_skip") {
      shouldContinue = false;
    }
  }
}

/**
 * 执行二维码认证后的检查步骤。
 */
async function runAuthQrNextStepMenu(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  let shouldContinue = true;

  while (shouldContinue) {
    const selection = await runtime.select("请选择二维码认证后的下一步", [
      {
        label: "检查二维码认证",
        value: "auth_qr_next_check"
      },
      {
        label: "跳过后续操作",
        value: "auth_qr_next_skip"
      }
    ]);

    if (selection === "auth_qr_next_check") {
      const responseBody = await checkQrAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
      await writeAuthStateForAccount(runtime, account_id);
    }

    if (selection === "auth_qr_next_skip") {
      shouldContinue = false;
    }
  }
}

/**
 * 让用户按账号当前状态选择一种认证方式。
 */
async function runAuthMethodSelection(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const selection = await runtime.select("请选择认证方式", [
    {
      label: "验证码/手机号配对",
      value: "auth_method_code"
    },
    {
      label: "二维码认证",
      value: "auth_method_qr"
    },
    {
      label: "Session 导入",
      value: "auth_method_session"
    },
    {
      label: "暂不认证",
      value: "auth_method_skip"
    }
  ]);

  if (selection === "auth_method_code") {
    await runCodeAuthMethod(runtime, account_id);
  }

  if (selection === "auth_method_qr") {
    await runQrAuthMethod(runtime, account_id);
  }

  if (selection === "auth_method_session") {
    await runSessionAuthMethod(runtime, account_id);
  }
}

/**
 * 串联账号认证向导。
 */
async function runAuthGuideForAccount(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  await writeAuthStateForAccount(runtime, account_id);
  await runAuthMethodSelection(runtime, account_id);
}

/**
 * 启动账号认证向导。
 */
async function runAuthGuide(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");

  await runAuthGuideForAccount(runtime, account_id);
}

/**
 * 提交账号验证码。
 */
async function runSubmitAuthCode(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");

  await submitCodeForAccount(runtime, account_id);
}

/**
 * 启动账号二维码认证。
 */
async function runStartQrAuth(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await startQrAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 检查账号二维码认证。
 */
async function runCheckQrAuth(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await checkQrAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 提交账号二次认证密码。
 */
async function runSubmitAuthPassword(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");

  await submitPasswordForAccount(runtime, account_id);
}

/**
 * 导入账号认证 session。
 */
async function runImportAuthSession(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");

  await runSessionAuthMethod(runtime, account_id);
}

/**
 * 取消账号当前认证流程。
 */
async function runCancelAuth(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await cancelAuth(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 刷新账号 runtime 状态。
 */
async function runRefreshRuntime(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await refreshRuntime(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 启动账号 runtime。
 */
async function runStartRuntime(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await startRuntime(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 重连账号 runtime。
 */
async function runReconnectRuntime(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const responseBody = await reconnectRuntime(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 停止账号 runtime。
 */
async function runStopRuntime(runtime: InteractiveDemoRuntime): Promise<void> {
  const account_id = await promptField(runtime, "account_id");
  const confirmed = await promptField(runtime, "confirm_stop_runtime");

  if (confirmed !== "STOP") {
    runtime.write("已取消停止 runtime。");
    return;
  }

  const responseBody = await stopRuntime(runtime.recorder.client, account_id);

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 发送已选择渠道的文本消息。
 */
async function runSendTextMessage(runtime: InteractiveDemoRuntime): Promise<void> {
  const channel = await selectSupportedChannel(runtime);

  if (channel === "back") {
    return;
  }

  if (channel === "whatsapp") {
    const account_id = await promptField(runtime, "account_id");
    const recipient_id = await promptField(runtime, "recipient_id");
    const text = await promptField(runtime, "text");
    const responseBody = await sendWhatsAppTextMessage(runtime.recorder.client, {
      account_id,
      to: {
        id: recipient_id,
        type: "user"
      },
      text
    });

    writeCurrentResponse(runtime, responseBody);
  }
}

/**
 * 展示 ngrok 本地接收 webhook 的配置流程。
 */
async function runWebhookNgrokGuide(runtime: InteractiveDemoRuntime): Promise<void> {
  runtime.write("1. 确认本机已安装 ngrok 并完成 authtoken 配置。");
  runtime.write("2. 运行：pnpm demo:webhook:ngrok");
  runtime.write("3. 复制控制台输出的 Webhook endpoint URL。");
  runtime.write(
    "4. 回到本菜单选择“创建 webhook endpoint”，url 填控制台输出的 Webhook endpoint URL。"
  );
  runtime.write("5. 触发渠道消息后，在当前终端查看本地 webhook event 输出。");
  runtime.write("6. 打开 http://127.0.0.1:4040 查看请求详情并使用 replay。");
  runtime.write("注意：当前项目固定接收 POST /webhook，不使用 /events。");
}

/**
 * 创建 webhook endpoint 并提示 recipient_id 来源。
 */
async function runCreateWebhookEndpoint(runtime: InteractiveDemoRuntime): Promise<void> {
  runtime.write("接收消息前，请另开终端运行：pnpm demo:webhook:ngrok");
  runtime.write("Webhook endpoint 的 url 需要指向公网可访问的 POST /webhook。");
  runtime.write("如果使用 ngrok，请填写：https://xxxx.ngrok-free.app/webhook");
  const url = await promptField(runtime, "url");
  const signing_secret = await promptField(runtime, "signing_secret");
  const responseBody = await createWebhookEndpoint(runtime.recorder.client, {
    url,
    status: "active",
    subscribed_events: ["*"],
    signing_secret,
    retry_policy: {
      max_attempts: 3
    }
  });

  writeCurrentResponse(runtime, responseBody);
  runtime.write(
    "收到 message.received 后，复制 data.conversation.id 作为发送消息流程的 recipient_id。"
  );
}

/**
 * 串联客户演示推荐流程。
 */
async function runRecommendedFlow(runtime: InteractiveDemoRuntime): Promise<void> {
  const channel = await selectSupportedChannel(runtime);

  if (channel === "back") {
    return;
  }

  if (channel === "whatsapp") {
    await runWorkspaceCheck(runtime);

    const regionsResponse = await listWhatsAppRegions(runtime.recorder.client);
    writeCurrentResponse(runtime, regionsResponse);

    await runAccountList(runtime);
    await runCreateAccountForWhatsApp(runtime);

    const account_id = await promptField(runtime, "account_id");
    await runAuthGuideForAccount(runtime, account_id);

    const runtimeSelection = await runtime.select("请确认认证状态为 authorized 后再继续", [
      {
        label: "继续启动 runtime",
        value: "continue_runtime"
      },
      {
        label: "暂停推荐流程",
        value: "pause_recommended"
      }
    ]);

    if (runtimeSelection === "pause_recommended") {
      return;
    }

    const startRuntimeResponse = await startRuntime(runtime.recorder.client, account_id);
    writeCurrentResponse(runtime, startRuntimeResponse);

    const refreshRuntimeResponse = await refreshRuntime(runtime.recorder.client, account_id);
    writeCurrentResponse(runtime, refreshRuntimeResponse);

    await runSendTextMessageForWhatsApp(runtime, account_id);
  }
}

/**
 * 推荐流程中复用 WhatsApp 账号创建参数读取。
 */
async function runCreateAccountForWhatsApp(runtime: InteractiveDemoRuntime): Promise<void> {
  const name = await promptField(runtime, "name");
  const region = await promptField(runtime, "region");
  const phone = await promptField(runtime, "phone");
  const responseBody = await createWhatsAppCodeAccount(runtime.recorder.client, {
    name,
    region,
    phone
  });

  writeCurrentResponse(runtime, responseBody);
}

/**
 * 推荐流程中复用 WhatsApp 文本消息参数读取。
 */
async function runSendTextMessageForWhatsApp(
  runtime: InteractiveDemoRuntime,
  account_id: string
): Promise<void> {
  const recipient_id = await promptField(runtime, "recipient_id");
  const text = await promptField(runtime, "text");
  const responseBody = await sendWhatsAppTextMessage(runtime.recorder.client, {
    account_id,
    to: {
      id: recipient_id,
      type: "user"
    },
    text
  });

  writeCurrentResponse(runtime, responseBody);
}

const BASIC_CHECK_ACTIONS: DemoAction[] = [
  {
    key: "workspace_check",
    title: "workspace 校验",
    run: runWorkspaceCheck
  },
  {
    key: "account_list",
    title: "查询账号列表",
    run: runAccountList
  },
  {
    key: "provider_regions",
    title: "查询渠道可用区域",
    run: runChannelRegions
  }
];

const ACCOUNT_ACTIONS: DemoAction[] = [
  {
    key: "account_list",
    title: "查询账号列表",
    run: runAccountList
  },
  {
    key: "account_regions",
    title: "查询渠道可用区域",
    run: runChannelRegions
  },
  {
    key: "account_create",
    title: "创建账号",
    run: runCreateAccount
  },
  {
    key: "account_get",
    title: "查询账号详情",
    run: runGetAccount
  }
];

const AUTH_ACTIONS: DemoAction[] = [
  {
    key: "auth_guide",
    title: "账号认证向导",
    run: runAuthGuide
  },
  {
    key: "auth_start",
    title: "启动验证码/手机号配对",
    run: runStartAuth
  },
  {
    key: "auth_state",
    title: "查询授权状态",
    run: runAuthState
  },
  {
    key: "auth_code",
    title: "提交验证码",
    run: runSubmitAuthCode
  },
  {
    key: "auth_qr_start",
    title: "启动二维码认证",
    run: runStartQrAuth
  },
  {
    key: "auth_qr_check",
    title: "检查二维码认证",
    run: runCheckQrAuth
  },
  {
    key: "auth_password",
    title: "提交二次认证密码",
    run: runSubmitAuthPassword
  },
  {
    key: "auth_session",
    title: "导入 Session",
    run: runImportAuthSession
  },
  {
    key: "auth_cancel",
    title: "取消认证",
    run: runCancelAuth
  },
  {
    key: "runtime_refresh",
    title: "刷新 runtime 状态",
    run: runRefreshRuntime
  },
  {
    key: "runtime_start",
    title: "启动 runtime",
    run: runStartRuntime
  },
  {
    key: "runtime_reconnect",
    title: "重连 runtime",
    run: runReconnectRuntime
  },
  {
    key: "runtime_stop",
    title: "停止 runtime",
    run: runStopRuntime
  }
];

const MESSAGE_ACTIONS: DemoAction[] = [
  {
    key: "message_send_text",
    title: "发送文本消息",
    run: runSendTextMessage
  }
];

const WEBHOOK_ACTIONS: DemoAction[] = [
  {
    key: "webhook_ngrok_guide",
    title: "ngrok 本地接收流程",
    run: runWebhookNgrokGuide
  },
  {
    key: "webhook_create_endpoint",
    title: "创建 webhook endpoint",
    run: runCreateWebhookEndpoint
  }
];

/**
 * 客户演示菜单中的能力域流程。
 */
const DEMO_ACTIONS: DemoAction[] = [
  {
    key: "basic",
    title: "基础检查",
    async run(runtime) {
      await runActionMenu(runtime, "请选择基础检查流程", BASIC_CHECK_ACTIONS);
    }
  },
  {
    key: "accounts",
    title: "账号相关",
    async run(runtime) {
      await runActionMenu(runtime, "请选择账号相关流程", ACCOUNT_ACTIONS);
    }
  },
  {
    key: "auth",
    title: "授权相关",
    async run(runtime) {
      await runActionMenu(runtime, "请选择授权相关流程", AUTH_ACTIONS);
    }
  },
  {
    key: "messages",
    title: "消息演示",
    async run(runtime) {
      await runActionMenu(runtime, "请选择消息演示流程", MESSAGE_ACTIONS);
    }
  },
  {
    key: "webhook",
    title: "Webhook 相关",
    async run(runtime) {
      await runActionMenu(runtime, "请选择 Webhook 相关流程", WEBHOOK_ACTIONS);
    }
  },
  {
    key: "recommended",
    title: "推荐流程",
    async run(runtime) {
      await runRecommendedFlow(runtime);
    }
  },
  ...FULL_API_DEMO_ACTIONS
];

/**
 * 生成交互式 demo 主菜单选择项。
 */
export function getDemoMenuChoices(): CliSelectChoice[] {
  const choices = getActionChoices(DEMO_ACTIONS, "退出");
  const normalizedChoices: CliSelectChoice[] = [];

  for (const choice of choices) {
    if (choice.value === "back") {
      normalizedChoices.push({
        label: "退出",
        value: "exit"
      });
    } else {
      normalizedChoices.push(choice);
    }
  }

  return normalizedChoices;
}

/**
 * 生成交互式 demo 菜单文本，供测试或非交互输出复用。
 */
export function getDemoMenuText(): string {
  const lines = ["", "请选择要执行的 UnifyPort demo 流程："];

  for (const choice of getDemoMenuChoices()) {
    lines.push(choice.label);
  }

  return lines.join("\n");
}

/**
 * 根据菜单选择执行一个 demo 流程。
 */
export async function runDemoAction(
  runtime: InteractiveDemoRuntime,
  selection: string
): Promise<boolean> {
  if (selection === "exit") {
    return false;
  }

  for (const action of DEMO_ACTIONS) {
    if (action.key === selection) {
      await action.run(runtime);
      return true;
    }
  }

  runtime.write("未识别的流程，请重新选择。");
  return true;
}

/**
 * 通过上下键主菜单选择并执行一个 demo 流程。
 */
export async function runDemoSelection(runtime: InteractiveDemoRuntime): Promise<boolean> {
  try {
    const selection = await runtime.select(
      "请选择要执行的 UnifyPort demo 流程",
      getDemoMenuChoices()
    );

    return await runDemoAction(runtime, selection);
  } catch (error) {
    if (isPromptExit(error)) {
      return false;
    }

    throw error;
  }
}

/**
 * 启动交互式 demo 命令行。
 */
export async function runInteractiveDemo(): Promise<void> {
  const runtime: InteractiveDemoRuntime = {
    recorder: createCliRequestRecorder(createUnifyPortClient(readUnifyPortClientConfig())),
    prompt: createInquirerPrompt(),
    select: createInquirerSelect(),
    write(message) {
      console.log(message);
    }
  };
  let shouldContinue = true;

  while (shouldContinue) {
    shouldContinue = await runDemoSelection(runtime);
  }
}
