import { listWhatsAppRegions } from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 调用 GET /v1/providers/whatsapp/regions 查询 WhatsApp 可用区域。
 *
 * 这个入口用于演示渠道能力发现，不创建账号、不启动授权，也不发送消息。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const responseBody = await listWhatsAppRegions(recorder.client);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
