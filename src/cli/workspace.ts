import { readUnifyPortClientConfig } from "../core/env.js";
import { createUnifyPortClient } from "../core/unifyport-client.js";

/**
 * 调用 GET /v1/workspace 验证 API Key 对应的 workspace。
 *
 * 这是客户演示中最小的连通性检查入口，只依赖 UNIFYPORT_API_KEY 和
 * UNIFYPORT_BASE_URL，不涉及任何渠道账号状态。
 */
async function main(): Promise<void> {
  const client = createUnifyPortClient(readUnifyPortClientConfig());
  const responseBody = await client.request({
    method: "GET",
    path: "/v1/workspace"
  });

  console.log(JSON.stringify(responseBody, null, 2));
}

await main();
