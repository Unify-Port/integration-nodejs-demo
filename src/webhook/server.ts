import { readWebhookEnvironment } from "../core/env.js";
import { createWebhookApp } from "./app.js";

/**
 * 启动本地 Webhook 演示服务。
 *
 * 这个入口不会被测试命令自动启动，只有显式执行 pnpm demo:webhook 时才会监听端口。
 */
function main(): void {
  const environment = readWebhookEnvironment();
  const app = createWebhookApp({
    signingSecret: environment.webhookSigningSecret
  });

  app.listen(environment.port, () => {
    console.log(`UnifyPort webhook demo listening on ${environment.port}`);
  });
}

main();
