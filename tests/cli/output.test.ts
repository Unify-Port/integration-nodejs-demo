import { describe, expect, it, vi } from "vitest";
import type { UnifyPortClient, UnifyPortRequest } from "../../src/core/unifyport-client.js";
import {
  createCliRequestRecorder,
  formatCliRequest,
  printCliResponse
} from "../../src/cli/output.js";

describe("cli output", () => {
  it("记录 CLI 实际发出的 request", async () => {
    const requests: UnifyPortRequest[] = [];
    const client: UnifyPortClient = {
      async request(request) {
        requests.push(request);
        return {
          data: {
            ok: true
          }
        };
      }
    };
    const recorder = createCliRequestRecorder(client);

    const responseBody = await recorder.client.request({
      method: "GET",
      path: "/v1/accounts/acc_example/conversations",
      query: {
        type: "user,group",
        limit: 20,
        cursor: ""
      }
    });

    expect(responseBody).toEqual({
      data: {
        ok: true
      }
    });
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations",
        query: {
          type: "user,group",
          limit: 20,
          cursor: ""
        }
      }
    ]);
    expect(recorder.getRequest()).toEqual({
      method: "GET",
      path: "/v1/accounts/acc_example/conversations",
      query: {
        type: "user,group",
        limit: 20,
        cursor: ""
      }
    });
  });

  it("格式化 request 的 method、path 和 query", () => {
    expect(
      formatCliRequest({
        method: "GET",
        path: "/v1/accounts/acc_example/conversations",
        query: {
          type: "user,group",
          limit: 20,
          cursor: ""
        }
      })
    ).toBe("GET /v1/accounts/acc_example/conversations?type=user%2Cgroup&limit=20&cursor=");
  });

  it("先打印接口再打印响应内容", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      printCliResponse(
        {
          method: "GET",
          path: "/v1/workspace"
        },
        {
          data: {
            name: "demo"
          }
        }
      );

      expect(log.mock.calls).toEqual([
        ["GET /v1/workspace"],
        [
          JSON.stringify(
            {
              data: {
                name: "demo"
              }
            },
            null,
            2
          )
        ]
      ]);
    } finally {
      log.mockRestore();
    }
  });
});
