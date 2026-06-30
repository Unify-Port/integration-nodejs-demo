import { describe, expect, it } from "vitest";
import { createUnifyPortClient } from "../../src/core/unifyport-client.js";

describe("createUnifyPortClient", () => {
  it("发送 JSON 请求时携带 X-Api-Key 和 Content-Type", async () => {
    let requestUrl = "";
    let requestInit: RequestInit = {};
    const fetcher: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestInit = init as RequestInit;

      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    };

    const client = createUnifyPortClient({
      baseUrl: "https://api.unifyport.ai",
      apiKey: "key_1",
      fetch: fetcher
    });
    const body = {
      name: "Production Workspace",
      status: "active",
      metadata: {
        env: "production"
      }
    };

    const responseBody = await client.request({
      method: "PATCH",
      path: "/v1/workspace",
      body
    });

    expect(requestUrl).toBe("https://api.unifyport.ai/v1/workspace");
    expect(requestInit.method).toBe("PATCH");
    expect(requestInit.body).toBe(JSON.stringify(body));
    expect(requestInit.headers).toBeInstanceOf(Headers);
    const headers = requestInit.headers as Headers;
    expect(headers.get("X-Api-Key")).toBe("key_1");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(responseBody).toEqual({ data: { ok: true } });
  });

  it("没有请求体时不携带 Content-Type", async () => {
    let requestInit: RequestInit = {};
    const fetcher: typeof fetch = async (input, init) => {
      requestInit = init as RequestInit;

      return new Response(JSON.stringify({ data: { name: "Production Workspace" } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    };

    const client = createUnifyPortClient({
      baseUrl: "https://api.unifyport.ai",
      apiKey: "key_1",
      fetch: fetcher
    });

    await client.request({
      method: "GET",
      path: "/v1/workspace"
    });

    expect(requestInit.headers).toBeInstanceOf(Headers);
    const headers = requestInit.headers as Headers;
    expect(headers.get("X-Api-Key")).toBe("key_1");
    expect(headers.get("Content-Type")).toBe(null);
    expect(requestInit.body).toBe(undefined);
  });
});
