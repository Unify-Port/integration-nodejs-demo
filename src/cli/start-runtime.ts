import { readUnifyPortClientConfig } from "../core/env.js";
import { startRuntime } from "../resources/runtime/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 启动账号 runtime。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const account_id = process.argv[2] as string;
  const responseBody = await startRuntime(recorder.client, account_id);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
