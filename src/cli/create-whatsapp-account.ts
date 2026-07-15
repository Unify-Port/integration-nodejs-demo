import { createWhatsAppCodeAccount } from "../channels/whatsapp/api.js";
import { readUnifyPortClientConfig } from "../core/env.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 创建 WhatsApp code 授权账号。
 *
 * 参数顺序固定为 name、region、phone，字段构造仍放在 WhatsApp 渠道目录。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const name = process.argv[2] as string;
  const region = process.argv[3] as string;
  const phone = process.argv[4] as string;
  const responseBody = await createWhatsAppCodeAccount(recorder.client, {
    name,
    region,
    phone
  });

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
