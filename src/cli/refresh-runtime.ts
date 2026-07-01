import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";
import { refreshRuntime } from "../resources/runtime/api.js";
import { createCliRequestRecorder, printCliResponse } from "./output.js";

/**
 * 刷新账号 runtime 状态。
 *
 * 这个入口只执行文档中的 refresh 动作，不暴露 start、stop、reconnect 一键入口。
 */
async function main(): Promise<void> {
  const recorder = createCliRequestRecorder(createUnifyPortClient(readUnifyPortClientConfig()));
  const account_id = process.argv[2] as string;
  const responseBody = await refreshRuntime(recorder.client, account_id);

  printCliResponse(recorder.getRequest(), responseBody);
}

await main();
