import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readUnifyPortClientConfig } from "../../src/core/env.js";

const originalCwd = process.cwd();
let originalApiKey: string | undefined;
let originalBaseUrl: string | undefined;

describe("readUnifyPortClientConfig", () => {
  beforeEach(() => {
    originalApiKey = process.env.UNIFYPORT_API_KEY;
    originalBaseUrl = process.env.UNIFYPORT_BASE_URL;
    delete process.env.UNIFYPORT_API_KEY;
    delete process.env.UNIFYPORT_BASE_URL;
  });

  afterEach(() => {
    process.chdir(originalCwd);

    if (originalApiKey === undefined) {
      delete process.env.UNIFYPORT_API_KEY;
    } else {
      process.env.UNIFYPORT_API_KEY = originalApiKey;
    }

    if (originalBaseUrl === undefined) {
      delete process.env.UNIFYPORT_BASE_URL;
    } else {
      process.env.UNIFYPORT_BASE_URL = originalBaseUrl;
    }
  });

  it("从当前工作目录的 .env 读取 UnifyPort API 配置", () => {
    const cwd = mkdtempSync(join(tmpdir(), "unifyport-env-"));
    mkdirSync(cwd, { recursive: true });
    writeFileSync(
      join(cwd, ".env"),
      ["UNIFYPORT_API_KEY=key_from_dotenv", "UNIFYPORT_BASE_URL=https://api.unifyport.ai", ""].join(
        "\n"
      )
    );
    process.chdir(cwd);

    const config = readUnifyPortClientConfig();

    expect({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    }).toEqual({
      apiKey: "key_from_dotenv",
      baseUrl: "https://api.unifyport.ai"
    });
  });

  it(".env.local 覆盖 .env 的本地配置", () => {
    const cwd = mkdtempSync(join(tmpdir(), "unifyport-env-local-"));
    mkdirSync(cwd, { recursive: true });
    writeFileSync(
      join(cwd, ".env"),
      ["UNIFYPORT_API_KEY=key_from_dotenv", "UNIFYPORT_BASE_URL=https://api.unifyport.ai", ""].join(
        "\n"
      )
    );
    writeFileSync(
      join(cwd, ".env.local"),
      [
        "UNIFYPORT_API_KEY=key_from_dotenv_local",
        "UNIFYPORT_BASE_URL=https://local.unifyport.ai",
        ""
      ].join("\n")
    );
    process.chdir(cwd);

    const config = readUnifyPortClientConfig();

    expect({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    }).toEqual({
      apiKey: "key_from_dotenv_local",
      baseUrl: "https://local.unifyport.ai"
    });
  });
});
