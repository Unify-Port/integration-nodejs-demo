import { readUnifyPortClientConfig } from "../core/env.js";
import { refreshRuntime } from "../resources/runtime/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 刷新账号 runtime 状态。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const account_id = process.argv[2] as string;
  const responseBody = await refreshRuntime(recorder.client, account_id);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
