import type { UnifyPortClient, UnifyPortRequest } from "../../src/core/unifyport-client.js";

export interface RecordingClient {
  client: UnifyPortClient;
  requests: UnifyPortRequest[];
}

export function createRecordingClient(): RecordingClient {
  const requests: UnifyPortRequest[] = [];
  const client: UnifyPortClient = {
    async request(request) {
      requests.push(request);
      return {
        data: {
          ok: true
        }
      };
    }
  };

  return {
    client,
    requests
  };
}
