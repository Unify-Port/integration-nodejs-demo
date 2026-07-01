import { describe, expect, it } from "vitest";
import {
  reconnectRuntime,
  refreshRuntime,
  startRuntime,
  stopRuntime
} from "../../src/resources/runtime/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("runtime resources", () => {
  it("封装 Runtime endpoint", async () => {
    const { client, requests } = createRecordingClient();

    await refreshRuntime(client, "acc_example");
    await startRuntime(client, "acc_example");
    await stopRuntime(client, "acc_example");
    await reconnectRuntime(client, "acc_example");

    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/refresh",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/start",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/stop",
        body: {}
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/runtime/reconnect",
        body: {}
      }
    ]);
  });
});
