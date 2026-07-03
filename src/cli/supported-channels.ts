import type { CliSelectChoice, CliSelectRuntime } from "./select-prompt.js";

export type SupportedChannelId = "whatsapp";

export interface SupportedChannel {
  id: SupportedChannelId;
  label: string;
}

const BACK_VALUE = "back";

export const SUPPORTED_CHANNELS: SupportedChannel[] = [
  {
    id: "whatsapp",
    label: "WhatsApp"
  }
];

/**
 * 生成当前已经真实接入的渠道选择项。
 */
export function getSupportedChannelChoices(): CliSelectChoice[] {
  const choices: CliSelectChoice[] = [];

  for (const channel of SUPPORTED_CHANNELS) {
    choices.push({
      label: channel.label,
      value: channel.id
    });
  }

  choices.push({
    label: "返回上级菜单",
    value: BACK_VALUE
  });

  return choices;
}

/**
 * 在需要渠道能力的流程中选择 provider。
 */
export async function selectSupportedChannel(
  runtime: CliSelectRuntime
): Promise<SupportedChannelId | typeof BACK_VALUE> {
  const selected = await runtime.select("请选择渠道", getSupportedChannelChoices());

  return selected as SupportedChannelId | typeof BACK_VALUE;
}
