import { describe, expect, it } from "vitest";
import {
  buildNgrokArgs,
  buildWebhookEndpointUrl,
  extractNgrokPublicUrl
} from "../../src/webhook/ngrok-server.js";

describe("webhook ngrok server", () => {
  it("生成 ngrok 本地端口转发参数", () => {
    expect(buildNgrokArgs(3000)).toEqual(["http", "3000", "--log=stdout"]);
  });

  it("从 ngrok 日志中提取公网 HTTPS 地址", () => {
    expect(
      extractNgrokPublicUrl(
        't=2026-07-03T18:11:25+0800 lvl=info msg="started tunnel" url=https://demo.ngrok-free.app'
      )
    ).toBe("https://demo.ngrok-free.app");
  });

  it("拼接 UnifyPort webhook endpoint URL", () => {
    expect(buildWebhookEndpointUrl("https://demo.ngrok-free.app")).toBe(
      "https://demo.ngrok-free.app/webhook"
    );
  });
});
