import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";
import { createWebhookEndpoint } from "../resources/webhook-endpoints/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 创建 webhook endpoint。
 *
 * URL 从命令行参数读取，signing_secret 复用项目已有的 WEBHOOK_SIGNING_SECRET。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(createUnifyPortClient(readUnifyPortClientConfig()));
  const url = process.argv[2] as string;
  const responseBody = await createWebhookEndpoint(recorder.client, {
    url,
    status: "active",
    subscribed_events: ["*"],
    signing_secret: process.env.WEBHOOK_SIGNING_SECRET as string,
    retry_policy: {
      max_attempts: 3
    }
  });

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
