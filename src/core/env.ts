import { config as loadDotenv } from "dotenv";
import type { UnifyPortClientConfig } from "./unifyport-client.js";

export interface WebhookEnvironment {
  webhookSigningSecret: string;
  port: number;
}

/**
 * 加载项目环境变量文件。
 *
 * `.env.local` 放在 `.env` 前面加载，因此本地配置会优先于项目默认配置。
 * dotenv 默认不会覆盖进程里已经存在的环境变量，所以终端 export 的值仍然最高优先级。
 */
function loadEnvironmentFiles(): void {
  loadDotenv({
    path: [".env.local", ".env"],
    quiet: true
  });
}

/**
 * 从进程环境变量读取 UnifyPort REST API 客户端配置。
 *
 * 环境变量名固定为当前 demo 约定的 UNIFYPORT_API_KEY 和
 * UNIFYPORT_BASE_URL，不在代码里兼容其他别名，避免客户演示时出现多套配置口径。
 */
export function readUnifyPortClientConfig(): UnifyPortClientConfig {
  loadEnvironmentFiles();

  return {
    baseUrl: process.env.UNIFYPORT_BASE_URL as string,
    apiKey: process.env.UNIFYPORT_API_KEY as string,
    fetch
  };
}

/**
 * 从进程环境变量读取 Webhook 演示服务配置。
 *
 * WEBHOOK_SIGNING_SECRET 对应文档里的 signing_secret，PORT 只负责本地监听端口。
 */
export function readWebhookEnvironment(): WebhookEnvironment {
  loadEnvironmentFiles();

  return {
    webhookSigningSecret: process.env.WEBHOOK_SIGNING_SECRET as string,
    port: Number(process.env.PORT)
  };
}
