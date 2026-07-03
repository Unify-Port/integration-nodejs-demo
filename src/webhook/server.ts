import { readWebhookEnvironment } from "../core/env.js";
import { createWebhookApp } from "./app.js";

/**
 * 启动本地 Webhook 演示服务。
 *
 * 这个入口保留为底层本地接收服务实现，客户演示默认使用 pnpm demo:webhook:ngrok。
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
