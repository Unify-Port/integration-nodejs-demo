# integration-nodejs-demo

`integration-nodejs-demo` 是一个基于 pnpm、Node.js 和 TypeScript 的 UnifyPort REST API 演示仓库。它提供统一 REST client、资源级 API wrapper、WhatsApp 渠道示例流程、交互式 CLI demo，以及 Webhook 接收与签名校验示例。

这个仓库的重点不是搭建业务系统，而是把 UnifyPort API 的调用方式、字段边界、演示入口和测试验证方式放在一个可运行的 TypeScript 项目里。

## 当前能力

- 统一 REST client：封装 `X-Api-Key`、`baseUrl`、`method`、`path`、`query`、`body` 和 JSON 请求体。
- 通用资源 wrapper：覆盖 Workspace、Providers、Accounts、Authentication、Runtime、Conversations、Messages、Contacts、Groups、API Keys 和 Webhook Endpoints。
- WhatsApp 渠道流程：封装 WhatsApp regions、code auth 账号创建、code auth 启动、文本消息发送 payload。
- CLI 演示入口：提供 `pnpm demo` 交互式菜单，也保留多个单独 demo 脚本。
- 全接口演示菜单：当前测试要求直接接口入口合计为 68 个 endpoint。
- Webhook 示例：提供 `POST /webhook` 接收服务、`X-Device-Signature` 校验和事件输出。
- 自动化验证：使用 Vitest、TypeScript、ESLint、Prettier 和 build 组成 `pnpm check`。

## 技术栈

| 项目      | 当前配置                                      |
| --------- | --------------------------------------------- |
| 包管理器  | `pnpm@11.7.0`                                 |
| Node.js   | `>=20.19.0`                                   |
| 模块格式  | ESM，`package.json` 中配置 `"type": "module"` |
| 语言      | TypeScript                                    |
| HTTP 服务 | Express                                       |
| 环境变量  | dotenv                                        |
| CLI 执行  | tsx                                           |
| 测试      | Vitest                                        |
| 静态检查  | ESLint、TypeScript                            |
| 格式化    | Prettier                                      |

## 目录结构

```text
.
├── src
│   ├── channels
│   │   └── whatsapp
│   ├── cli
│   ├── core
│   ├── resources
│   │   ├── accounts
│   │   ├── api-keys
│   │   ├── auth
│   │   ├── contacts
│   │   ├── conversations
│   │   ├── groups
│   │   ├── messages
│   │   ├── providers
│   │   ├── runtime
│   │   ├── webhook-endpoints
│   │   └── workspace
│   └── webhook
├── tests
│   ├── channels
│   ├── cli
│   ├── core
│   ├── helpers
│   ├── resources
│   └── webhook
├── eslint.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.build.json
├── tsconfig.json
└── vitest.config.ts
```

### 关键目录说明

- `src/core/unifyport-client.ts`：统一 REST client，负责通用请求规则。
- `src/core/env.ts`：读取 `.env.local`、`.env` 和进程环境变量。
- `src/resources/*/api.ts`：按 API resource 拆分的 wrapper。
- `src/resources/shared.ts`：资源层共享工具，目前用于 path parameter 替换。
- `src/channels/whatsapp/api.ts`：WhatsApp 渠道流程封装。
- `src/channels/whatsapp/payloads.ts`：WhatsApp 渠道 payload 构造。
- `src/cli/demo.ts`：`pnpm demo` 的入口。
- `src/cli/interactive-demo.ts`：主交互菜单。
- `src/cli/full-api-demo.ts`：全接口分组菜单。
- `src/cli/conversations-demo.ts`：Conversations 二级菜单。
- `src/cli/output.ts`：CLI 请求行和响应输出。
- `src/cli/prompt-help.ts`：CLI 参数说明和输入提示。
- `src/webhook/app.ts`：Express Webhook app。
- `src/webhook/server.ts`：`pnpm demo:webhook` 服务入口。
- `src/webhook/signature.ts`：Webhook 签名校验。
- `src/webhook/event-output.ts`：Webhook 事件控制台输出。

## 环境变量

项目当前只读取以下环境变量：

| 变量名                   | 用途                                   |
| ------------------------ | -------------------------------------- |
| `UNIFYPORT_API_KEY`      | UnifyPort REST API 的 `X-Api-Key` 来源 |
| `UNIFYPORT_BASE_URL`     | UnifyPort REST API 的 base URL         |
| `WEBHOOK_SIGNING_SECRET` | Webhook 签名校验密钥                   |
| `PORT`                   | `pnpm demo:webhook` 本地监听端口       |

`.env.local` 会先于 `.env` 加载。dotenv 默认不覆盖进程中已存在的同名环境变量，所以终端里已经 export 的变量优先级最高。

本地可以按下面格式准备 `.env.local`：

```dotenv
UNIFYPORT_API_KEY=
UNIFYPORT_BASE_URL=
WEBHOOK_SIGNING_SECRET=
PORT=
```

不要提交 `.env.local`。当前 `.gitignore` 已忽略 `.env.local`。

## 安装依赖

```bash
pnpm install
```

仓库配置了 `engine-strict=true`，因此本地 Node.js 版本需要满足 `>=20.19.0`。

## 常用命令

| 命令                | 作用                                                           |
| ------------------- | -------------------------------------------------------------- |
| `pnpm lint`         | 检查 `src`、`tests`、`vitest.config.ts` 和 `eslint.config.mjs` |
| `pnpm format:check` | 检查全仓 Prettier 格式                                         |
| `pnpm format`       | 格式化全仓                                                     |
| `pnpm test`         | 运行 Vitest                                                    |
| `pnpm typecheck`    | 运行 TypeScript 类型检查，不输出文件                           |
| `pnpm build`        | 使用 `tsconfig.build.json` 编译 `src` 到 `dist`                |
| `pnpm check`        | 依次运行 lint、format:check、test、typecheck 和 build          |

## Demo 脚本

| 命令                                | 入口文件                                | 说明                         |
| ----------------------------------- | --------------------------------------- | ---------------------------- |
| `pnpm demo`                         | `src/cli/demo.ts`                       | 统一交互式 demo 菜单         |
| `pnpm demo:workspace`               | `src/cli/workspace.ts`                  | 查询 workspace               |
| `pnpm demo:accounts:list`           | `src/cli/list-accounts.ts`              | 查询账号列表                 |
| `pnpm demo:conversations`           | `src/cli/conversations.ts`              | 进入 Conversations 菜单      |
| `pnpm demo:webhook-endpoint:create` | `src/cli/create-webhook-endpoint.ts`    | 创建 Webhook endpoint        |
| `pnpm demo:whatsapp:regions`        | `src/cli/whatsapp-regions.ts`           | 查询 WhatsApp 可用区域       |
| `pnpm demo:whatsapp:create-account` | `src/cli/create-whatsapp-account.ts`    | 创建 WhatsApp code auth 账号 |
| `pnpm demo:whatsapp:auth-start`     | `src/cli/start-whatsapp-auth.ts`        | 启动 WhatsApp code auth      |
| `pnpm demo:auth:state`              | `src/cli/auth-state.ts`                 | 查询账号 auth state          |
| `pnpm demo:runtime:start`           | `src/cli/start-runtime.ts`              | 启动 runtime                 |
| `pnpm demo:runtime:refresh`         | `src/cli/refresh-runtime.ts`            | 刷新 runtime 状态            |
| `pnpm demo:message:send-text`       | `src/cli/send-whatsapp-text-message.ts` | 发送 WhatsApp 文本消息       |
| `pnpm demo:webhook`                 | `src/webhook/server.ts`                 | 启动本地 Webhook 接收服务    |

`pnpm demo:webhook` 会启动本地 Node.js 服务并监听 `PORT`，不要把它当作普通静态验证命令使用。

## 交互式 Demo 菜单

`pnpm demo` 会进入主菜单。当前主菜单包含以下快捷流程：

| 菜单项 | 标题                           |
| ------ | ------------------------------ |
| `1`    | workspace 校验                 |
| `2`    | 查询账号列表                   |
| `3`    | 查询 WhatsApp 可用区域         |
| `4`    | 创建 WhatsApp 账号             |
| `5`    | 启动 WhatsApp 登录             |
| `6`    | 查询 auth state                |
| `7`    | 刷新 runtime 状态              |
| `8`    | 启动 runtime                   |
| `9`    | 发送 WhatsApp 文本消息         |
| `10`   | Webhook 接收 recipient_id 流程 |
| `11`   | 会话操作                       |
| `0`    | 退出                           |

主菜单还会追加全接口分组入口：

| 菜单项 | 分组              | endpoint 数量 |
| ------ | ----------------- | ------------- |
| `12`   | 推荐流程          | 0             |
| `13`   | Workspace         | 2             |
| `14`   | Providers         | 1             |
| `15`   | Accounts          | 5             |
| `16`   | Authentication    | 8             |
| `17`   | Runtime           | 4             |
| `18`   | Conversations     | 13            |
| `19`   | Messages          | 9             |
| `20`   | Contacts          | 6             |
| `21`   | Groups            | 10            |
| `22`   | API Keys          | 4             |
| `23`   | Webhook Endpoints | 6             |

全接口分组中，delete、rotate、stop、leave、block、revoke 等高风险动作需要输入指定确认词后才会真正发起请求。非必填参数直接回车时会从请求对象中省略，不会传空字符串，也不会补默认值。

## Webhook 演示

Webhook 接收服务位于 `src/webhook`：

- `createWebhookApp` 只暴露 `POST /webhook`。
- 请求体使用 `express.raw({ type: "application/json" })` 保留原始字节。
- 签名校验读取 `X-Device-Timestamp` 和 `X-Device-Signature`。
- 签名内容为 timestamp、英文句点和原始请求体。
- 事件通过 `writeWebhookEvent` 输出到控制台。
- `message.received` 事件会额外输出 `recipient_id`。

启动 Webhook 服务需要显式运行：

```bash
pnpm demo:webhook
```

该命令会监听 `PORT`。如果只是验证代码，不需要启动这个服务。

## 资源层边界

`src/resources` 中的文件只做 REST endpoint wrapper，不做业务编排：

- `workspace`：`GET /v1/workspace`、`PATCH /v1/workspace`
- `providers`：`GET /v1/providers/{provider}/regions`
- `accounts`：账号列表、创建、详情、更新、删除
- `auth`：账号认证状态、code auth、QR auth、password、session、cancel
- `runtime`：refresh、start、stop、reconnect
- `conversations`：会话列表、详情、成员、已读、未读、静音、置顶、标签
- `messages`：文本、媒体、联系人、回复、mention、pin、revoke、reaction、edit
- `contacts`：联系人列表、详情、block、unblock、blocklist、note
- `groups`：群列表、详情、创建、退出、成员、群信息、入群请求、入群审批、邀请码
- `api-keys`：列表、创建、更新、rotate
- `webhook-endpoints`：列表、创建、详情、更新、deactivate、删除

新增资源 wrapper 时，应继续保持 resource 目录和测试目录一一对应。

## WhatsApp 渠道边界

WhatsApp 专属流程位于 `src/channels/whatsapp`：

- `listWhatsAppRegions` 调用 `/v1/providers/whatsapp/regions`。
- `createWhatsAppCodeAccount` 构造 `provider: "whatsapp"`、`status: "active"`、`auth_mode: "code"` 和 `provider_data.phone`。
- `startWhatsAppCodeAuth` 调用 `/v1/accounts/{account_id}/auth/start`。
- `sendWhatsAppTextMessage` 构造 `POST /v1/messages` 的 WhatsApp 文本消息请求体。

渠道字段只能放在渠道目录或明确依赖渠道的 CLI 流程中，不要混入 `src/core`。

## 使用方式示例

```ts
import { createUnifyPortClient, listAccounts } from "./src/index.js";

const client = createUnifyPortClient({
  baseUrl: process.env.UNIFYPORT_BASE_URL as string,
  apiKey: process.env.UNIFYPORT_API_KEY as string,
  fetch
});

const responseBody = await listAccounts(client);
console.log(responseBody);
```

## 开发约束

- 不要新增同义字段名、同义环境变量名或兼容别名。
- 不要为缺失字段补 fallback。
- 不要在 resource wrapper 中手写 query string，统一交给 `UnifyPortRequest.query`。
- 路径参数替换使用 `replacePathParameter`。
- 新增 CLI 菜单时要同步补 `tests/cli/*`。
- 新增 resource wrapper 时要同步补 `tests/resources/*`。
- 修改 Webhook 签名或事件输出时要同步补 `tests/webhook/*`。
- 不要手动编辑 `dist`。

## 验证建议

提交前优先运行：

```bash
pnpm check
git diff --check
```

如果只改了某个局部模块，可以先运行对应测试。例如：

```bash
pnpm test tests/resources/accounts.test.ts
pnpm test tests/cli/full-api-demo.test.ts
pnpm test tests/webhook/signature.test.ts
```

最终交付时需要说明已经运行的命令，以及没有运行的验证项。
