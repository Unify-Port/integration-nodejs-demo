import { readUnifyPortClientConfig } from "../core/env.js";
import { listAccounts } from "../resources/accounts/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 查询当前 workspace 下的账号列表。
 *
 * 这是安全的只读演示入口，用于确认当前 API Key 可访问的渠道账号。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const responseBody = await listAccounts(recorder.client);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
