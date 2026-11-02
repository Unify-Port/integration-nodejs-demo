import type {
  UnifyPortClient,
  UnifyPortQuery,
  UnifyPortRequest
} from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询 webhook endpoint 列表。
 */
export function listWebhookEndpoints(
  client: UnifyPortClient,
  query?: UnifyPortQuery
): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "GET",
    path: "/v1/webhook-endpoints"
  };
  /** 账号范围由调用方显式提供；省略时保留原有工作区调用，不自动补目标。 */
  if (query !== undefined) {
    request.query = query;
  }
  return client.request(request);
}

/**
 * 创建 webhook endpoint。
 */
export function createWebhookEndpoint(client: UnifyPortClient, body: unknown): Promise<unknown> {
  return client.request({
    method: "POST",
    path: "/v1/webhook-endpoints",
    body
  });
}

/**
 * 查询单个 webhook endpoint。
 */
export function getWebhookEndpoint(
  client: UnifyPortClient,
  endpoint_id: string,
  query?: UnifyPortQuery
): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "GET",
    path: replacePathParameter("/v1/webhook-endpoints/{endpoint_id}", "endpoint_id", endpoint_id)
  };
  /** 账号范围由调用方显式提供；省略时保留原有工作区调用，不自动补目标。 */
  if (query !== undefined) {
    request.query = query;
  }
  return client.request(request);
}

/**
 * 更新 webhook endpoint。
 */
export function updateWebhookEndpoint(
  client: UnifyPortClient,
  endpoint_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "PATCH",
    path: replacePathParameter("/v1/webhook-endpoints/{endpoint_id}", "endpoint_id", endpoint_id),
    body
  });
}

/**
 * 停用 webhook endpoint。
 */
export function deactivateWebhookEndpoint(
  client: UnifyPortClient,
  endpoint_id: string,
  query?: UnifyPortQuery
): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "POST",
    path: replacePathParameter(
      "/v1/webhook-endpoints/{endpoint_id}/deactivate",
      "endpoint_id",
      endpoint_id
    )
  };
  /** 账号范围由调用方显式提供；省略时保留原有工作区调用，不自动补目标。 */
  if (query !== undefined) {
    request.query = query;
  }
  return client.request(request);
}

/**
 * 删除 webhook endpoint。
 */
export function deleteWebhookEndpoint(
  client: UnifyPortClient,
  endpoint_id: string,
  query?: UnifyPortQuery
): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "DELETE",
    path: replacePathParameter("/v1/webhook-endpoints/{endpoint_id}", "endpoint_id", endpoint_id)
  };
  /** 账号范围由调用方显式提供；省略时保留原有工作区调用，不自动补目标。 */
  if (query !== undefined) {
    request.query = query;
  }
  return client.request(request);
}
