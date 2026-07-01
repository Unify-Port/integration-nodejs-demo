import { describe, expect, it } from "vitest";
import {
  blockContact,
  getContact,
  listBlocklist,
  listContacts,
  setContactNote,
  unblockContact
} from "../../src/resources/contacts/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("contacts resources", () => {
  it("封装 Contacts endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const contactBody = {
      contact_id: "user_example"
    };
    const noteBody = {
      contact_id: "user_example",
      note: "VIP customer - order #1042"
    };

    await listContacts(client, "acc_example", {
      limit: 50,
      cursor: "",
      q: ""
    });
    await getContact(client, "acc_example", {
      contact_id: "user_example"
    });
    await blockContact(client, "acc_example", contactBody);
    await unblockContact(client, "acc_example", contactBody);
    await listBlocklist(client, "acc_example");
    await setContactNote(client, "acc_example", noteBody);

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/contacts",
        query: {
          limit: 50,
          cursor: "",
          q: ""
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/contacts/info",
        query: {
          contact_id: "user_example"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/contacts/block",
        body: contactBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/contacts/unblock",
        body: contactBody
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/contacts/blocklist"
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/contacts/note",
        body: noteBody
      }
    ]);
  });
});
