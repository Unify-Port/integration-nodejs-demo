/**
 * 替换文档路径中的单个 path parameter。
 *
 * resources 层只负责把文档中的 `{account_id}`、`{key_id}`、`{endpoint_id}`
 * 等占位符替换为调用方传入的真实值，不在这里新增字段或做兼容逻辑。
 */
export function replacePathParameter(path: string, parameter: string, value: string): string {
  return path.replace(`{${parameter}}`, value);
}
