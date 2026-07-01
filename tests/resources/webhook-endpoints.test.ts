import { describe, expect, it } from "vitest";
import {
  createWebhookEndpoint,
  deactivateWebhookEndpoint,
  deleteWebhookEndpoint,
  getWebhookEndpoint,
  listWebhookEndpoints,
  updateWebhookEndpoint
} from "../../src/resources/webhook-endpoints/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("webhook endpoints resources", () => {
  it("封装 Webhook Endpoints endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const createBody = {
      url: "https://example.com/webhook",
      status: "active",
      subscribed_events: ["*"],
      signing_secret: "<WEBHOOK_SIGNING_SECRET>",
      retry_policy: {
        max_attempts: 3
      }
    };
    const updateBody = {
      url: "https://example.com/webhook-updated",
      status: "inactive",
      subscribed_events: ["message.status.updated"],
      signing_secret: "",
      retry_policy: {
        max_attempts: 1
      }
    };

    await listWebhookEndpoints(client);
    await createWebhookEndpoint(client, createBody);
    await getWebhookEndpoint(client, "we_example");
    await updateWebhookEndpoint(client, "we_example", updateBody);
    await deactivateWebhookEndpoint(client, "we_example");
    await deleteWebhookEndpoint(client, "we_example");

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/webhook-endpoints"
      },
      {
        method: "POST",
        path: "/v1/webhook-endpoints",
        body: createBody
      },
      {
        method: "GET",
        path: "/v1/webhook-endpoints/we_example"
      },
      {
        method: "PATCH",
        path: "/v1/webhook-endpoints/we_example",
        body: updateBody
      },
      {
        method: "POST",
        path: "/v1/webhook-endpoints/we_example/deactivate"
      },
      {
        method: "DELETE",
        path: "/v1/webhook-endpoints/we_example"
      }
    ]);
  });
});
