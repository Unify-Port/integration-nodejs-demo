import { describe, expect, it } from "vitest";
import {
  deleteConversationLabel,
  getConversation,
  listConversationLabels,
  listConversationMembers,
  listConversations,
  markConversationRead,
  markConversationUnread,
  muteConversation,
  pinConversation,
  setConversationLabelMembers,
  unmuteConversation,
  unpinConversation,
  upsertConversationLabel
} from "../../src/resources/conversations/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("conversations resources", () => {
  it("封装 Conversations endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const readBody = {
      conversation_id: "peer_example",
      up_to_message_id: "msg_example"
    };
    const conversationBody = {
      conversation_id: "peer_example"
    };
    const muteBody = {
      conversation_id: "peer_example",
      duration: 86400
    };
    const upsertLabelBody = {
      label_id: "",
      name: "VIP"
    };
    const deleteLabelBody = {
      label_id: "label_example"
    };
    const labelMembersBody = {
      label_id: "label_example",
      action: "add",
      conversation_ids: ["peer_example"]
    };

    await listConversations(client, "acc_example", {
      type: "user,group",
      limit: 20,
      cursor: ""
    });
    await getConversation(client, "acc_example", {
      conversation_id: "peer_example",
      type: "group"
    });
    await listConversationMembers(client, "acc_example", {
      conversation_id: "peer_example",
      type: "group",
      limit: 50,
      cursor: ""
    });
    await markConversationRead(client, "acc_example", readBody);
    await markConversationUnread(client, "acc_example", conversationBody);
    await muteConversation(client, "acc_example", muteBody);
    await unmuteConversation(client, "acc_example", conversationBody);
    await pinConversation(client, "acc_example", conversationBody);
    await unpinConversation(client, "acc_example", conversationBody);
    await listConversationLabels(client, "acc_example", {
      limit: 50,
      cursor: ""
    });
    await upsertConversationLabel(client, "acc_example", upsertLabelBody);
    await deleteConversationLabel(client, "acc_example", deleteLabelBody);
    await setConversationLabelMembers(client, "acc_example", labelMembersBody);

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations",
        query: {
          type: "user,group",
          limit: 20,
          cursor: ""
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/info",
        query: {
          conversation_id: "peer_example",
          type: "group"
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/members",
        query: {
          conversation_id: "peer_example",
          type: "group",
          limit: 50,
          cursor: ""
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/read",
        body: readBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unread",
        body: conversationBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/mute",
        body: muteBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unmute",
        body: conversationBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/pin",
        body: conversationBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/unpin",
        body: conversationBody
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/conversations/labels",
        query: {
          limit: 50,
          cursor: ""
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels/upsert",
        body: upsertLabelBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels/delete",
        body: deleteLabelBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/conversations/labels",
        body: labelMembersBody
      }
    ]);
  });
});
