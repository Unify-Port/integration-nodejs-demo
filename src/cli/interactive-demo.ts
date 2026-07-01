import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  createWhatsAppCodeAccount,
  listWhatsAppRegions,
  sendWhatsAppTextMessage,
  startWhatsAppCodeAuth
} from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";
import { getAccountAuth } from "../resources/auth/api.js";
import { refreshRuntime } from "../resources/runtime/api.js";
import { createWebhookEndpoint } from "../resources/webhook-endpoints/api.js";
import {
  createCliRequestRecorder,
  writeCliResponse,
  type CliRequestRecorder,
  type CliWrite
} from "./output.js";

export type DemoPrompt = (label: string) => Promise<string>;

export interface InteractiveDemoRuntime {
  recorder: CliRequestRecorder;
  prompt: DemoPrompt;
  write: CliWrite;
}

interface DemoAction {
  key: string;
  title: string;
  run(runtime: InteractiveDemoRuntime): Promise<void>;
}

/**
 * 输出当前请求响应。
 */
function writeCurrentResponse(runtime: InteractiveDemoRuntime, responseBody: unknown): void {
  writeCliResponse(runtime.write, runtime.recorder.getRequest(), responseBody);
}

/**
 * 客户演示菜单中的安全流程。
 */
const DEMO_ACTIONS: DemoAction[] = [
  {
    key: "1",
    title: "workspace 校验",
    async run(runtime) {
      const responseBody = await runtime.recorder.client.request({
        method: "GET",
        path: "/v1/workspace"
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "2",
    title: "查询 WhatsApp 可用区域",
    async run(runtime) {
      const responseBody = await listWhatsAppRegions(runtime.recorder.client);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "3",
    title: "创建 WhatsApp 账号",
    async run(runtime) {
      const name = await runtime.prompt("name");
      const region = await runtime.prompt("region");
      const phone = await runtime.prompt("phone");
      const responseBody = await createWhatsAppCodeAccount(runtime.recorder.client, {
        name,
        region,
        phone
      });

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "4",
    title: "启动 WhatsApp 登录",
    async run(runtime) {
      const account_id = await runtime.prompt("account_id");
      const responseBody = await startWhatsAppCodeAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "5",
    title: "查询 auth state",
    async run(runtime) {
      const account_id = await runtime.prompt("account_id");
      const responseBody = await getAccountAuth(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "6",
    title: "刷新 runtime 状态",
    async run(runtime) {
      const account_id = await runtime.prompt("account_id");
      const responseBody = await refreshRuntime(runtime.recorder.client, account_id);

      writeCurrentResponse(runtime, responseBody);
    }
  },
  {
    key: "7",
    title: "发送 WhatsApp 文本消息",
    async run(runtime) {
      const account_id = await runtime.prompt("account_id");
      const recipient_id = await runtime.prompt("recipient_id");
      const text = await runtime.prompt("text");
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
  },
  {
    key: "8",
    title: "创建 webhook endpoint",
    async run(runtime) {
      const url = await runtime.prompt("url");
      const signing_secret = await runtime.prompt("signing_secret");
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
    }
  }
];

/**
 * 生成交互式 demo 菜单文本。
 */
export function getDemoMenuText(): string {
  const lines = ["", "请选择要执行的 UnifyPort demo 流程："];

  for (const action of DEMO_ACTIONS) {
    lines.push(`${action.key}. ${action.title}`);
  }

  lines.push("0. 退出");

  return lines.join("\n");
}

/**
 * 根据菜单选择执行一个 demo 流程。
 */
export async function runDemoAction(
  runtime: InteractiveDemoRuntime,
  selection: string
): Promise<boolean> {
  if (selection === "0") {
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
 * 启动交互式 demo 命令行。
 */
export async function runInteractiveDemo(): Promise<void> {
  const readline = createInterface({
    input,
    output
  });
  const runtime: InteractiveDemoRuntime = {
    recorder: createCliRequestRecorder(createUnifyPortClient(readUnifyPortClientConfig())),
    async prompt(label) {
      return readline.question(`${label}: `);
    },
    write(message) {
      console.log(message);
    }
  };
  let shouldContinue = true;

  try {
    while (shouldContinue) {
      runtime.write(getDemoMenuText());
      const selection = await runtime.prompt("请选择流程");
      shouldContinue = await runDemoAction(runtime, selection);
    }
  } finally {
    readline.close();
  }
}
