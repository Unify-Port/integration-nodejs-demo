/**
 * 替换文档路径中的单个 path parameter。
 *
 * resources 层只负责把文档中的 `{account_id}`、`{key_id}`、`{endpoint_id}`
 * 等占位符替换为调用方传入的原始 ID，并编码为一个路径段，避免斜杠或问号改变路由。
 */
export function replacePathParameter(path: string, parameter: string, value: string): string {
  return path.replace(`{${parameter}}`, encodeURIComponent(value));
}
