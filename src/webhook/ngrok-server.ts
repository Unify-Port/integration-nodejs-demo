import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Server } from "node:http";
import type { Readable } from "node:stream";
import { readWebhookEnvironment } from "../core/env.js";
import { createWebhookApp } from "./app.js";

type NgrokProcess = ChildProcessByStdio<null, Readable, Readable>;

/**
 * 生成 ngrok 转发本地 webhook 端口的命令参数。
 */
export function buildNgrokArgs(port: number): string[] {
  return ["http", String(port), "--log=stdout"];
}

/**
 * 从 ngrok 日志中提取公网 HTTPS 根地址。
 */
export function extractNgrokPublicUrl(text: string): string {
  const match = /url=(https:\/\/\S+)/.exec(text);

  if (match === null) {
    return "";
  }

  const publicUrl = match[1];

  if (publicUrl === undefined) {
    return "";
  }

  return publicUrl;
}

/**
 * 拼接 UnifyPort webhook endpoint URL。
 */
export function buildWebhookEndpointUrl(publicUrl: string): string {
  return `${publicUrl}/webhook`;
}

/**
 * 输出 ngrok 日志，并在 tunnel 就绪时提示可注册的 webhook URL。
 */
function pipeNgrokOutput(ngrok: NgrokProcess): void {
  let hasPrintedEndpointUrl = false;

  ngrok.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString("utf8");
    process.stdout.write(text);

    if (hasPrintedEndpointUrl === false) {
      const publicUrl = extractNgrokPublicUrl(text);

      if (publicUrl.length > 0) {
        console.log(`Webhook endpoint URL: ${buildWebhookEndpointUrl(publicUrl)}`);
        console.log("ngrok inspector: http://127.0.0.1:4040");
        hasPrintedEndpointUrl = true;
      }
    }
  });

  ngrok.stderr.on("data", (chunk: Buffer) => {
    process.stderr.write(chunk);
  });
}

/**
 * 在同一个命令中启动本地 webhook 服务和 ngrok tunnel。
 */
function main(): void {
  const environment = readWebhookEnvironment();
  const app = createWebhookApp({
    signingSecret: environment.webhookSigningSecret
  });

  const server = app.listen(environment.port, () => {
    console.log(`UnifyPort webhook demo listening on ${environment.port}`);
    console.log(`Starting ngrok tunnel for http://localhost:${String(environment.port)}`);

    const ngrok = spawn("ngrok", buildNgrokArgs(environment.port), {
      stdio: ["inherit", "pipe", "pipe"]
    });

    pipeNgrokOutput(ngrok);
    bindShutdown(server, ngrok);
  });
}

/**
 * 绑定退出信号，确保本地服务和 ngrok 子进程一起退出。
 */
function bindShutdown(server: Server, ngrok: NgrokProcess): void {
  let isShuttingDown = false;

  const shutdown = (): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    ngrok.kill("SIGINT");
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  ngrok.on("exit", (code) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    server.close(() => {
      if (typeof code === "number") {
        process.exit(code);
        return;
      }

      process.exit(1);
    });
  });
}

/**
 * 判断当前模块是否为命令行入口。
 */
function isCurrentEntry(): boolean {
  const entry = process.argv[1];

  if (entry === undefined) {
    return false;
  }

  if (entry.endsWith("ngrok-server.ts")) {
    return true;
  }

  if (entry.endsWith("ngrok-server.js")) {
    return true;
  }

  return false;
}

if (isCurrentEntry()) {
  main();
}
