import { startWhatsAppCodeAuth } from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 启动 WhatsApp 手机号配对授权。
 *
 * account_id 从命令行参数读取，渠道流程仍由 WhatsApp API 模块封装。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const account_id = process.argv[2] as string;
  const responseBody = await startWhatsAppCodeAuth(recorder.client, account_id);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
