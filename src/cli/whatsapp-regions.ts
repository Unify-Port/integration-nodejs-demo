import { listWhatsAppRegions } from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";

/**
 * 调用 GET /v1/providers/whatsapp/regions 查询 WhatsApp 可用区域。
 *
 * 这个入口用于演示渠道能力发现，不创建账号、不启动授权，也不发送消息。
 */
async function main(): Promise<void> {
  const client = createUnifyPortClient(readUnifyPortClientConfig());
  const responseBody = await listWhatsAppRegions(client);

  console.log(JSON.stringify(responseBody, null, 2));
}

await main();
