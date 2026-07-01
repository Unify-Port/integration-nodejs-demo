import { describe, expect, it } from "vitest";
import { getWorkspace, updateWorkspace } from "../../src/resources/workspace/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("workspace resources", () => {
  it("封装 Workspace endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const body = {
      name: "Production Workspace",
      status: "active",
      metadata: {
        region: "global",
        env: "production"
      }
    };

    await getWorkspace(client);
    await updateWorkspace(client, body);

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/workspace"
      },
      {
        method: "PATCH",
        path: "/v1/workspace",
        body
      }
    ]);
  });
});
