import { describe, expect, it } from "vitest";
import {
  createApiKey,
  listApiKeys,
  rotateApiKey,
  updateApiKey
} from "../../src/resources/api-keys/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("api keys resources", () => {
  it("封装 API Keys endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const createBody = {
      name: "Production key",
      prefix: "dk_live"
    };
    const updateBody = {
      status: "inactive"
    };
    const rotateBody = {
      name: "Rotated production key",
      prefix: "dk_live"
    };

    await listApiKeys(client);
    await createApiKey(client, createBody);
    await updateApiKey(client, "key_example", updateBody);
    await rotateApiKey(client, "key_example", rotateBody);

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/api-keys"
      },
      {
        method: "POST",
        path: "/v1/api-keys",
        body: createBody
      },
      {
        method: "PATCH",
        path: "/v1/api-keys/key_example",
        body: updateBody
      },
      {
        method: "POST",
        path: "/v1/api-keys/key_example/rotate",
        body: rotateBody
      }
    ]);
  });
});
