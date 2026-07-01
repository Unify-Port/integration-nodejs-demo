import { describe, expect, it } from "vitest";
import {
  editMessage,
  pinMessage,
  reactMessage,
  revokeMessage,
  sendContactMessage,
  sendMediaMessage,
  sendMentionMessage,
  sendReplyMessage,
  sendTextMessage
} from "../../src/resources/messages/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("messages resources", () => {
  it("封装 Messages endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const textBody = {
      account_id: "acc_example",
      to: {
        id: "user_example",
        type: "user"
      },
      message: {
        type: "text",
        text: "Hello from UnifyPort"
      },
      provider_data: {
        parse_mode: "Markdown"
      }
    };
    const mediaBody = {
      account_id: "acc_example",
      to: {
        id: "user_example",
        type: "user"
      },
      message: {
        type: "document",
        url: "https://example.com/demo.pdf",
        caption: "Demo PDF"
      }
    };
    const contactBody = {
      account_id: "acc_example",
      to: {
        id: "user_example",
        type: "user"
      },
      message: {
        type: "contact",
        contacts: [
          {
            name: "Jane Doe",
            phones: [
              {
                number: "+1 555 0100",
                type: "mobile"
              }
            ],
            emails: [
              {
                address: "jane@example.com"
              }
            ],
            organization: "Example Inc",
            title: "Customer Success"
          }
        ]
      }
    };
    const replyBody = {
      account_id: "acc_example",
      to: {
        id: "8613912345678@s.whatsapp.net",
        type: "user"
      },
      message: {
        type: "text",
        text: "Sure - replying to your question above."
      },
      reply_to: {
        reply_token: "<data.message.reply_token from the inbound event>"
      }
    };
    const mentionBody = {
      account_id: "acc_example",
      to: {
        id: "120363428346272482@g.us",
        type: "group"
      },
      message: {
        type: "text",
        text: "{{@8613912345678}} the report is ready."
      },
      mentions: [
        {
          id: "8613912345678@s.whatsapp.net"
        }
      ]
    };
    const pinBody = {
      account_id: "acc_example",
      conversation_id: "120363428346272482@g.us",
      message_id: "3EB0A185AAC596E2BB602C",
      pinned: true,
      duration_seconds: 604800
    };
    const revokeBody = {
      account_id: "acc_example",
      conversation_id: "8613912345678@s.whatsapp.net",
      message_id: "3EB0A185AAC596E2BB602C"
    };
    const reactionBody = {
      account_id: "acc_example",
      conversation_id: "8613912345678@s.whatsapp.net",
      message_id: "3EB0A185AAC596E2BB602C",
      sender_id: "8613912345678@s.whatsapp.net",
      emoji: "👍"
    };
    const editBody = {
      account_id: "acc_example",
      conversation_id: "8613912345678@s.whatsapp.net",
      message_id: "3EB0A185AAC596E2BB602C",
      content: "Corrected: the meeting is at 3pm, not 2pm."
    };

    await sendTextMessage(client, textBody);
    await sendMediaMessage(client, mediaBody);
    await sendContactMessage(client, contactBody);
    await sendReplyMessage(client, replyBody);
    await sendMentionMessage(client, mentionBody);
    await pinMessage(client, pinBody);
    await revokeMessage(client, revokeBody);
    await reactMessage(client, reactionBody);
    await editMessage(client, editBody);

    expect(requests).toEqual([
      {
        method: "POST",
        path: "/v1/messages",
        body: textBody
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: mediaBody
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: contactBody
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: replyBody
      },
      {
        method: "POST",
        path: "/v1/messages",
        body: mentionBody
      },
      {
        method: "POST",
        path: "/v1/messages/pin",
        body: pinBody
      },
      {
        method: "POST",
        path: "/v1/messages/revoke",
        body: revokeBody
      },
      {
        method: "POST",
        path: "/v1/messages/reaction",
        body: reactionBody
      },
      {
        method: "POST",
        path: "/v1/messages/edit",
        body: editBody
      }
    ]);
  });
});
