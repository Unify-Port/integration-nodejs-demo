import { describe, expect, it } from "vitest";
import { createUnifyPortClient } from "../../src/core/unifyport-client.js";

describe("createUnifyPortClient", () => {
  it("发送 JSON 请求时携带 X-Api-Key 和 Content-Type", async () => {
    const requests: Request[] = [];
    const fetcher = async (request: Request) => {
      requests.push(request);

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

    const result = await client.updateWorkspace({
      body
    });
    const request = requests[0] as Request;

    expect(request.url).toBe("https://api.unifyport.ai/v1/workspace");
    expect(request.method).toBe("PATCH");
    expect(await request.clone().text()).toBe(JSON.stringify(body));
    expect(request.headers.get("X-Api-Key")).toBe("key_1");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(result.data).toEqual({ data: { ok: true } });
  });

  it("没有请求体时不携带 Content-Type", async () => {
    const requests: Request[] = [];
    const fetcher = async (request: Request) => {
      requests.push(request);

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

    await client.getWorkspace();
    const request = requests[0] as Request;

    expect(request.headers.get("X-Api-Key")).toBe("key_1");
    expect(request.headers.get("Content-Type")).toBe(null);
    expect(request.body).toBe(null);
  });

  it("携带 query 时拼接为 URLSearchParams", async () => {
    const requests: Request[] = [];
    const fetcher = async (request: Request) => {
      requests.push(request);

      return new Response(JSON.stringify({ data: { items: [] } }), {
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

    await client.listConversations({
      params: {
        path: {
          account_id: "acc_example"
        },
        query: {
          type: "user,group",
          limit: 20,
          cursor: ""
        }
      }
    });
    const request = requests[0] as Request;

    expect(request.url).toBe(
      "https://api.unifyport.ai/v1/accounts/acc_example/conversations?type=user%2Cgroup&limit=20&cursor="
    );
  });
});
