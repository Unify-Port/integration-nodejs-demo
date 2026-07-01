import { describe, expect, it } from "vitest";
import {
  cancelAuth,
  checkQrAuth,
  getAccountAuth,
  importAuthSession,
  startCodeAuth,
  startQrAuth,
  submitAuthCode,
  submitAuthPassword
} from "../../src/resources/auth/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("auth resources", () => {
  it("封装 Authentication endpoint", async () => {
    const { client, requests } = createRecordingClient();

    await getAccountAuth(client, "acc_example");
    await startCodeAuth(client, "acc_example");
    await submitAuthCode(client, "acc_example", {
      code: "<VERIFICATION_CODE>"
    });
    await startQrAuth(client, "acc_example");
    await checkQrAuth(client, "acc_example");
    await submitAuthPassword(client, "acc_example", {
      password: "<TWO_FACTOR_PASSWORD>"
    });
    await importAuthSession(client, "acc_example", {
      session_url: "https://example.com/account.session"
    });
    await cancelAuth(client, "acc_example");

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/auth"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/start",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/code",
        body: {
          code: "<VERIFICATION_CODE>"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/qr/start",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/qr/check",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/password",
        body: {
          password: "<TWO_FACTOR_PASSWORD>"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/session",
        body: {
          session_url: "https://example.com/account.session"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/auth/cancel",
        body: {}
      }
    ]);
  });
});
