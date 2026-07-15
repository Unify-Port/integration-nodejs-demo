import { sendWhatsAppTextMessage } from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 发送 WhatsApp 文本消息。
 *
 * 参数顺序固定为 account_id、recipient_id、text，payload 仍由 WhatsApp 渠道模块生成。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const account_id = process.argv[2] as string;
  const recipient_id = process.argv[3] as string;
  const text = process.argv[4] as string;
  const responseBody = await sendWhatsAppTextMessage(recorder.client, {
    account_id,
    to: {
      id: recipient_id,
      type: "user"
    },
    text
  });

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
