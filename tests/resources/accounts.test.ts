import { describe, expect, it } from "vitest";
import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount
} from "../../src/resources/accounts/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("accounts resources", () => {
  it("封装 Accounts endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const createBody = {
      name: "Telegram Production",
      provider: "telegram",
      region: "global",
      status: "active",
      auth_mode: "qrcode",
      capabilities: ["send_message", "receive_message"],
      provider_data: {
        api_id: "123456",
        api_hash: "0123456789abcdef0123456789abcdef"
      },
      metadata: {
        team: "support"
      },
      provider_account_ref: "provider_account_example"
    };
    const updateBody = {
      name: "Telegram Production",
      provider: "telegram",
      region: "global",
      status: "active",
      auth_mode: "code",
      capabilities: ["send_message", "receive_message"],
      provider_data: {
        phone: "8613800138000"
      }
    };

    await listAccounts(client);
    await createAccount(client, createBody);
    await getAccount(client, "acc_example");
    await updateAccount(client, "acc_example", updateBody);
    await deleteAccount(client, "acc_example");

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts"
      },
      {
        method: "POST",
        path: "/v1/accounts",
        body: createBody
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example"
      },
      {
        method: "PATCH",
        path: "/v1/accounts/acc_example",
        body: updateBody
      },
      {
        method: "DELETE",
        path: "/v1/accounts/acc_example"
      }
    ]);
  });
});
