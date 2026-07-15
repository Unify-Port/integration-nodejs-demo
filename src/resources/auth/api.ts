import type { UnifyPortDeviceClient } from "@unifyport/sdk-node/device";

/**
 * 查询账号认证状态。
 * SDK 接入期间保留资源函数边界，避免现有调用方同步改写。
 */
export function getAccountAuth(
  client: UnifyPortDeviceClient,
  account_id: string
): Promise<unknown> {
  return client
    .getAccountAuthState({ params: { path: { account_id } } })
    .then((result) => result.data);
}

/**
 * 启动验证码认证流程。
 */
export function startCodeAuth(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .startAccountAuth({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 提交验证码。
 */
export function submitAuthCode(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .submitAccountAuthCode({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 启动二维码认证流程。
 */
export function startQrAuth(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .startAccountQrAuth({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 检查二维码认证状态。
 */
export function checkQrAuth(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .checkAccountQrAuth({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}

/**
 * 提交二次认证密码。
 */
export function submitAuthPassword(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .submitAccountAuthPassword({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 导入认证 session。
 */
export function importAuthSession(
  client: UnifyPortDeviceClient,
  account_id: string,
  body: unknown
): Promise<unknown> {
  return client
    .importAccountAuthSession({ params: { path: { account_id } }, body: body as never })
    .then((result) => result.data);
}

/**
 * 取消当前认证流程。
 */
export function cancelAuth(client: UnifyPortDeviceClient, account_id: string): Promise<unknown> {
  return client
    .cancelAccountAuth({ params: { path: { account_id } }, body: {} })
    .then((result) => result.data);
}
