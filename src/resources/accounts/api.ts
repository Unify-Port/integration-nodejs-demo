import type {
  UnifyPortClient,
  UnifyPortQuery,
  UnifyPortRequest
} from "../../core/unifyport-client.js";
import { replacePathParameter } from "../shared.js";

/**
 * 查询当前 workspace 下的账号列表。
 */
export function listAccounts(client: UnifyPortClient, query?: UnifyPortQuery): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "GET",
    path: "/v1/accounts"
  };
  /** 可选分页字段为空时省略，保留原有无参数调用。 */
  if (query !== undefined) {
    request.query = query;
  }
  return client.request(request);
}

/**
 * 创建一个渠道账号。
 */
export function createAccount(
  client: UnifyPortClient,
  body: unknown,
  headers?: Record<string, string>
): Promise<unknown> {
  const request: UnifyPortRequest = {
    method: "POST",
    path: "/v1/accounts",
    body
  };
  /** 幂等键必须由调用方为一次逻辑创建提供，不能由 wrapper 自动重试或生成。 */
  if (headers !== undefined) {
    request.headers = headers;
  }
  return client.request(request);
}

/**
 * 查询单个账号详情。
 */
export function getAccount(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id)
  });
}

/**
 * 更新单个账号。
 */
export function updateAccount(
  client: UnifyPortClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client.request({
    method: "PATCH",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id),
    body
  });
}

/**
 * 删除单个账号。
 */
export function deleteAccount(client: UnifyPortClient, account_id: string): Promise<unknown> {
  return client.request({
    method: "DELETE",
    path: replacePathParameter("/v1/accounts/{account_id}", "account_id", account_id)
  });
}

/**
 * 查询账号计费操作；只传递契约输入，渠道约束与授权状态由服务端判断。
 */
export function getAccountOperation(
  client: UnifyPortClient,
  operation_id: string
): Promise<unknown> {
  return client.request({
    method: "GET",
    path: replacePathParameter(
      "/v1/account-operations/{operation_id}",
      "operation_id",
      operation_id
    )
  });
}
