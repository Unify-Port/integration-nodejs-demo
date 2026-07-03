import express, { type Request, type Response } from "express";
import { writeWebhookEvent } from "./event-output.js";
import { verifyUnifyPortSignature } from "./signature.js";

export interface WebhookAppOptions {
  signingSecret: string;
}

/**
 * 创建 UnifyPort Webhook 接收应用。
 *
 * 这个应用只暴露 POST /webhook，并使用 express.raw 保留原始请求体字节，
 * 这样才能按文档要求完成 X-Device-Signature 校验。客户演示时收到的事件会
 * 直接打印到控制台，业务系统落库或分发逻辑后续应在这里之后单独接入。
 */
export function createWebhookApp(options: WebhookAppOptions): express.Express {
  const app = express();

  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    (request: Request, response: Response) => {
      const timestamp = request.get("X-Device-Timestamp");
      const signature = request.get("X-Device-Signature");

      if (timestamp === undefined) {
        response.sendStatus(401);
        return;
      }

      if (signature === undefined) {
        response.sendStatus(401);
        return;
      }

      const rawBody = request.body as Buffer;
      const verified = verifyUnifyPortSignature({
        rawBody,
        timestamp,
        signature,
        signingSecret: options.signingSecret
      });

      if (verified === false) {
        response.sendStatus(401);
        return;
      }

      const event = JSON.parse(rawBody.toString("utf8"));
      writeWebhookEvent(console.log, event);
      response.status(204).send();
    }
  );

  return app;
}
