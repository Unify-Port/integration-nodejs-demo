import { readUnifyPortClientConfig } from "../core/env.js";
import { getAccountAuth } from "../resources/auth/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 查询账号认证状态。
 *
 * 只调用 GET /v1/accounts/{account_id}/auth，不会改变账号状态。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(readUnifyPortClientConfig());
  const account_id = process.argv[2] as string;
  const responseBody = await getAccountAuth(recorder.client, account_id);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
