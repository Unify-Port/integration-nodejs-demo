import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询当前 workspace 下的账号列表。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function listAccounts(client: UnifyPortDeviceClient): Promise<unknown> {
  return client.listAccounts().then((result) => result.data);
}

/**
 * 创建一个渠道账号。
 */
export function createAccount(client: UnifyPortDeviceClient, body: unknown): Promise<unknown> {
  return client.createAccount({ body: body as never }).then((result) => result.data);
}

/**
 * 查询单个账号详情。
 */
export function getAccount(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client.getAccount({ params: { path: { account_id } } }).then((result) => result.data);
}

/**
 * 更新单个账号。
 */
export function updateAccount(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .updateAccount({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 删除单个账号。
 */
export function deleteAccount(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client.deleteAccount({ params: { path: { account_id } } }).then((result) => result.data);
}
