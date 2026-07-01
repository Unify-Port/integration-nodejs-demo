import { describe, expect, it } from "vitest";
import {
  createGroup,
  getGroup,
  getGroupInviteCode,
  leaveGroup,
  listGroupJoinRequests,
  listGroups,
  setGroupJoinApprovalMode,
  updateGroupInfo,
  updateGroupJoinRequests,
  updateGroupMembers
} from "../../src/resources/groups/api.js";
import { createRecordingClient } from "../helpers/recording-client.js";

describe("groups resources", () => {
  it("封装 Groups endpoint", async () => {
    const { client, requests } = createRecordingClient();
    const createBody = {
      name: "Project team",
      members: ["8613710881588"]
    };
    const leaveBody = {
      group_id: "group_example"
    };
    const membersBody = {
      group_id: "group_example",
      action: "add",
      member_id: "member_example"
    };
    const updateInfoBody = {
      group_id: "group_example",
      name: "Project team",
      description: "Q3 launch coordination",
      avatar_url: "https://example.com/avatar.jpg"
    };
    const joinRequestsBody = {
      group_id: "group_example",
      action: "approve",
      member_ids: ["member_example", "member_other"]
    };
    const approvalModeBody = {
      group_id: "group_example",
      enabled: true
    };

    await listGroups(client, "acc_example", {
      limit: 50,
      cursor: ""
    });
    await getGroup(client, "acc_example", {
      group_id: "group_example"
    });
    await createGroup(client, "acc_example", createBody);
    await leaveGroup(client, "acc_example", leaveBody);
    await updateGroupMembers(client, "acc_example", membersBody);
    await updateGroupInfo(client, "acc_example", updateInfoBody);
    await listGroupJoinRequests(client, "acc_example", {
      group_id: "group_example"
    });
    await updateGroupJoinRequests(client, "acc_example", joinRequestsBody);
    await setGroupJoinApprovalMode(client, "acc_example", approvalModeBody);
    await getGroupInviteCode(client, "acc_example", {
      group_id: "group_example"
    });

    expect(requests).toEqual([
      {
        method: "GET",
        path: "/v1/accounts/acc_example/groups",
        query: {
          limit: 50,
          cursor: ""
        }
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/groups/info",
        query: {
          group_id: "group_example"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/create",
        body: createBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/leave",
        body: leaveBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/members",
        body: membersBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/update-info",
        body: updateInfoBody
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/groups/join-requests",
        query: {
          group_id: "group_example"
        }
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/join-requests/update",
        body: joinRequestsBody
      },
      {
        method: "POST",
        path: "/v1/accounts/acc_example/groups/join-approval-mode",
        body: approvalModeBody
      },
      {
        method: "GET",
        path: "/v1/accounts/acc_example/groups/invite-code",
        query: {
          group_id: "group_example"
        }
      }
    ]);
  });
});
