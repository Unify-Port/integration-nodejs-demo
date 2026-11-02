import { describe, expect, it } from "vitest";
import {
  createCall,
  getActiveCall,
  hangupCall,
  getAccountOperation,
  createAccountAuthSession,
  submitAccountPasskeyResponse,
  confirmAccountPasskey,
  listPosts,
  getPost,
  listPostComments,
  replyPostComment,
  requestConversationHistory,
  createContact,
  getContactMembership
} from "../../src/index.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("public contract additions", () => {
  it("createCall uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await createCall(client, { example: true });
    expect(requests).toEqual([{ method: "POST", path: "/v1/calls", body: { example: true } }]);
  });
  it("getActiveCall uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await getActiveCall(client, { account_id: "example" });
    expect(requests).toEqual([
      { method: "GET", path: "/v1/calls/active", query: { account_id: "example" } }
    ]);
  });
  it("hangupCall uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await hangupCall(client, "example/value", { example: true });
    expect(requests).toEqual([
      { method: "POST", path: "/v1/calls/example%2Fvalue/hangup", body: { example: true } }
    ]);
  });
  it("getAccountOperation uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await getAccountOperation(client, "example/value");
    expect(requests).toEqual([{ method: "GET", path: "/v1/account-operations/example%2Fvalue" }]);
  });
  it("createAccountAuthSession uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await createAccountAuthSession(client, "example/value");
    expect(requests).toEqual([
      { method: "POST", path: "/v1/accounts/example%2Fvalue/auth-sessions" }
    ]);
  });
  it("submitAccountPasskeyResponse uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await submitAccountPasskeyResponse(client, "example/value", { example: true });
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/example%2Fvalue/auth/passkey-response",
        body: { example: true }
      }
    ]);
  });
  it("confirmAccountPasskey uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await confirmAccountPasskey(client, "example/value");
    expect(requests).toEqual([
      { method: "POST", path: "/v1/accounts/example%2Fvalue/auth/passkey-confirm" }
    ]);
  });
  it("listPosts uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await listPosts(client, "example/value", { cursor: "example", limit: "example" });
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/example%2Fvalue/posts",
        query: { cursor: "example", limit: "example" }
      }
    ]);
  });
  it("getPost uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await getPost(client, "example/value", { example: true });
    expect(requests).toEqual([
      { method: "POST", path: "/v1/accounts/example%2Fvalue/posts/info", body: { example: true } }
    ]);
  });
  it("listPostComments uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await listPostComments(client, "example/value", { example: true });
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/example%2Fvalue/posts/comments/list",
        body: { example: true }
      }
    ]);
  });
  it("replyPostComment uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await replyPostComment(client, "example/value", { example: true });
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/example%2Fvalue/posts/comments/reply",
        body: { example: true }
      }
    ]);
  });
  it("requestConversationHistory uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await requestConversationHistory(client, "example/value", { example: true });
    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/accounts/example%2Fvalue/conversations/history/request",
        body: { example: true }
      }
    ]);
  });
  it("createContact uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await createContact(client, "example/value", { example: true });
    expect(requests).toEqual([
      { method: "POST", path: "/v1/accounts/example%2Fvalue/contacts/add", body: { example: true } }
    ]);
  });
  it("getContactMembership uses its declared method and path", async () => {
    const { client, requests } = createRecordingClient();
    await getContactMembership(client, "example/value", { contact_id: "example" });
    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/example%2Fvalue/contacts/membership",
        query: { contact_id: "example" }
      }
    ]);
  });
});
