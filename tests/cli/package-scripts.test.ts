import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("demo cli scripts", () => {
  it("只暴露客户演示需要的安全 CLI 入口", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts).toMatchObject({
      demo: "tsx src/cli/demo.ts",
      "demo:workspace": "tsx src/cli/workspace.ts",
      "demo:webhook-endpoint:create": "tsx src/cli/create-webhook-endpoint.ts",
      "demo:whatsapp:regions": "tsx src/cli/whatsapp-regions.ts",
      "demo:whatsapp:create-account": "tsx src/cli/create-whatsapp-account.ts",
      "demo:whatsapp:auth-start": "tsx src/cli/start-whatsapp-auth.ts",
      "demo:auth:state": "tsx src/cli/auth-state.ts",
      "demo:runtime:refresh": "tsx src/cli/refresh-runtime.ts",
      "demo:message:send-text": "tsx src/cli/send-whatsapp-text-message.ts",
      "demo:webhook": "tsx src/webhook/server.ts"
    });
  });
});
