export interface CliPromptRuntime {
  prompt(label: string): Promise<string>;
  write(message: string): void;
}

export interface CliPromptField {
  name: string;
  required: boolean;
  type: string;
  description: string;
  example: string;
  emptyHint: string;
}

/**
 * 生成命令行参数说明，统一展示字段是否必填、类型、说明和示例。
 */
export function formatCliFieldHelp(field: CliPromptField): string {
  const lines: string[] = [];
  let requiredText = "[可选]";

  if (field.required === true) {
    requiredText = "[必填]";
  }

  lines.push(`参数 ${field.name} ${requiredText}`);
  lines.push(`类型：${field.type}`);
  lines.push(`说明：${field.description}`);
  lines.push(`示例：${field.example}`);

  if (field.emptyHint !== "") {
    lines.push(`空值：${field.emptyHint}`);
  }

  return lines.join("\n");
}

/**
 * 输入参数前先打印参数说明，避免用户只看到裸字段名。
 */
export async function promptCliField(
  runtime: CliPromptRuntime,
  field: CliPromptField
): Promise<string> {
  runtime.write(formatCliFieldHelp(field));

  return runtime.prompt(field.name);
}
