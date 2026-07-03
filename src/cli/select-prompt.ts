import { input, select } from "@inquirer/prompts";

export interface CliSelectChoice {
  label: string;
  value: string;
}

export interface CliSelectRuntime {
  select(label: string, choices: CliSelectChoice[]): Promise<string>;
}

export type CliInputPrompt = (label: string) => Promise<string>;

/**
 * 识别 inquirer 在 Ctrl+C 时抛出的退出异常。
 */
export function isPromptExit(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "ExitPromptError";
  }

  return false;
}

/**
 * 将内部选择项转换为 inquirer 的上下键选择项。
 */
function toInquirerChoices(choices: CliSelectChoice[]): Array<{
  name: string;
  value: string;
}> {
  return choices.map((choice) => ({
    name: choice.label,
    value: choice.value
  }));
}

/**
 * 创建生产环境使用的上下键选择适配器。
 */
export function createInquirerSelect(): CliSelectRuntime["select"] {
  return async function selectChoice(label, choices) {
    return select({
      message: label,
      choices: toInquirerChoices(choices),
      pageSize: choices.length
    });
  };
}

/**
 * 创建生产环境使用的文本输入适配器，避免和 inquirer select 混用 readline。
 */
export function createInquirerPrompt(): CliInputPrompt {
  return async function promptText(label) {
    return input({
      message: label
    });
  };
}
