import { UnifyPortDeviceClient, type DeviceClientConfig } from "@unifyport/sdk-node/device";

export type UnifyPortMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type UnifyPortQuery = Record<string, string | number | boolean>;

export type UnifyPortClientConfig = DeviceClientConfig & {
  readonly fetch: NonNullable<DeviceClientConfig["fetch"]>;
};

export interface UnifyPortRequest {
  method: UnifyPortMethod;
  path: string;
  query?: UnifyPortQuery;
  body?: unknown;
}

export type UnifyPortClient = UnifyPortDeviceClient;

/**
 * 创建 UnifyPort Device API 客户端。
 *
 * SDK 统一处理认证、请求序列化、超时、重试和错误边界，demo 只保留
 * client 创建入口，避免继续维护一套与公开 SDK 重复的 transport 实现。
 */
export function createUnifyPortClient(config: UnifyPortClientConfig): UnifyPortClient {
  return new UnifyPortDeviceClient(config);
}
