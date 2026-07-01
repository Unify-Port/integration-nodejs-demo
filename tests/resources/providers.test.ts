import { describe, expect, it } from "vitest";
import { listProviderRegions } from "../../src/resources/providers/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("providers resources", () => {
  it("封装 Providers endpoint", async () => {
    const { client, requests } = createRecordingClient();

    await listProviderRegions(client, "telegram");

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/providers/telegram/regions"
      }
    ]);
  });
});
