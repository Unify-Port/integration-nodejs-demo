import { readUnifyPortClientConfig } from "../core/env.js";
import { createCliRequestRecorder } from "./output.js";
import { runConversationsDemo, type ConversationsDemoRuntime } from "./conversations-demo.js";
import { createInquirerPrompt, createInquirerSelect } from "./select-prompt.js";

/**
 * 启动会话操作演示入口。
 */
async function main(): Promise<void> {
  const runtime: ConversationsDemoRuntime = {
    recorder: createCliRequestRecorder(readUnifyPortClientConfig()),
    prompt: createInquirerPrompt(),
    select: createInquirerSelect(),
    write(message) {
      console.log(message);
    }
  };

  await runConversationsDemo(runtime);
}

await main();
