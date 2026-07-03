import { describe, expect, it, vi } from "vitest";
import type { UnifyPortClient, UnifyPortRequest } from "../../src/core/unifyport-client.js";
import {
  createCliRequestRecorder,
  formatCliRequest,
  formatCliRequestBody,
  formatCliRequestQuery,
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

  it("格式化请求 query 和 body 参数", () => {
    expect(
      formatCliRequestQuery({
        method: "GET",
        path: "/v1/accounts",
        query: {
          limit: 20
        }
      })
    ).toBe(
      JSON.stringify(
        {
          limit: 20
        },
        null,
        2
      )
    );
    expect(
      formatCliRequestBody({
        method: "POST",
        path: "/v1/accounts",
        body: {
          name: "Demo Account",
          provider: "whatsapp"
        }
      })
    ).toBe(
      JSON.stringify(
        {
          name: "Demo Account",
          provider: "whatsapp"
        },
        null,
        2
      )
    );
    expect(
      formatCliRequestQuery({
        method: "GET",
        path: "/v1/workspace"
      })
    ).toBe("无");
    expect(
      formatCliRequestBody({
        method: "GET",
        path: "/v1/workspace"
      })
    ).toBe("无");
  });

  it("按分区打印接口、请求参数和响应内容", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      printCliResponse(
        {
          method: "POST",
          path: "/v1/accounts",
          query: {
            region: "global"
          },
          body: {
            name: "Demo Account"
          }
        },
        {
          data: {
            account_id: "acc_example"
          }
        }
      );

      expect(log.mock.calls).toEqual([
        ["========== Request =========="],
        ["POST /v1/accounts?region=global"],
        ["Query:"],
        [
          JSON.stringify(
            {
              region: "global"
            },
            null,
            2
          )
        ],
        ["Body:"],
        [
          JSON.stringify(
            {
              name: "Demo Account"
            },
            null,
            2
          )
        ],
        ["========== Response =========="],
        [
          JSON.stringify(
            {
              data: {
                account_id: "acc_example"
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
