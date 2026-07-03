# AGENTS.md

## 作用范围

本文件适用于当前仓库根目录及所有子目录。后续代理在本仓库内读取、分析、修改代码时，必须优先遵守这里的规则。

当前仓库是 `integration-nodejs-demo`，技术栈为 pnpm、Node.js、TypeScript、ESM、Vitest、ESLint、Prettier、Express、dotenv 和 tsx。

## 基本沟通规则

- 所有回复必须使用中文。
- 先给结论，再给证据；证据要尽量落到具体文件、函数、字段、脚本或命令。
- 不清楚用户意图时先问，不要静默选择实现方向。
- 发现多个可能解释时，先说明差异和影响，再继续。
- 默认不创建、修改或补充文档；只有用户明确要求文档时，才可以改文档。
- 不要输出与当前任务无关的文档式说明。

## 代码改动边界

- 所有改动必须是最小必要改动。
- 不要顺手重构、重排、格式化或优化与任务无关的代码。
- 不要改动用户已有未提交变更，除非当前任务必须依赖这些变更。
- 删除文件、代码块、字段、脚本或配置前，必须先说明删除对象和原因，并取得用户明确确认。
- 可能破坏现有逻辑的改动，必须先解释影响范围并取得用户明确确认。
- 如果本次改动直接造成导入、变量、函数或类型不再使用，只能清理本次改动造成的孤立内容；清理前仍需遵守删除确认规则。

## 标识符与字段规则

- 只使用当前代码、测试、配置或用户明确提供的标识符。
- 不要发明、推断、改名、补全、别名化任何变量、字段、类型、DTO、schema 或配置名。
- 用户给出的名称是权威名称，不能改写。
- 不要引入替代字段名。
- 不要增加兼容逻辑、fallback、alias 或替代配置。
- 除非用户明确要求，不要用 `||`、`??`、三元默认值或用来补偿缺字段的 `?.`。
- 当接口字段缺失、schema 不完整或命名不确定时，必须直接询问用户或先查当前仓库中的权威来源。

## 注释规则

- 代码注释必须使用中文。
- 代码注释必须使用 JSDoc 格式。
- 只在复杂逻辑、跨层边界、演示安全边界或字段规则不明显时补充简短注释。
- 不要写重复代码含义的空泛注释。

## 目录职责

- `src/core/unifyport-client.ts` 只负责通用 REST client：`baseUrl`、`apiKey`、`fetch`、`method`、`path`、`query`、`body`、`X-Api-Key` 和 JSON 序列化。
- `src/core/env.ts` 只负责读取 `.env.local`、`.env` 和进程环境变量中的固定配置。
- `src/resources/*/api.ts` 承载通用 UnifyPort REST API wrapper。
- `src/resources/shared.ts` 承载资源层共享的小工具，不要放渠道字段或业务流程。
- `src/channels/whatsapp/*` 只放 WhatsApp 渠道相关 payload 和流程封装。
- `src/cli/*` 只放命令行演示入口、菜单、参数提示和控制台输出。
- `src/webhook/*` 只放 Webhook 接收、签名校验和事件输出。
- `tests/*` 需要跟随源码目录边界组织测试。
- `dist`、`node_modules`、`.env.local`、`.DS_Store` 和 `docs` 已在 `.gitignore` 中忽略，不要把生成产物或本地敏感配置加入版本管理。

## 环境变量规则

本仓库当前只使用以下环境变量名：

- `UNIFYPORT_API_KEY`
- `UNIFYPORT_BASE_URL`
- `WEBHOOK_SIGNING_SECRET`
- `PORT`

不要新增同义环境变量名。不要把 API key、signing secret 或本地 `.env.local` 内容写进提交、文档、测试快照或日志说明。

`src/core/env.ts` 当前加载顺序是 `.env.local` 再 `.env`，dotenv 不覆盖进程中已存在的同名环境变量。修改该行为前必须先确认。

## CLI 与演示安全边界

- 默认不要启动 Node 服务检测代码。
- 如需运行 `pnpm demo:webhook` 或其他会监听端口的命令，必须先询问用户。
- 可以运行不启动服务的静态检查、单元测试、类型检查和构建命令。
- `pnpm demo` 是统一交互式演示入口。
- `pnpm demo:webhook` 是显式启动 Webhook 接收服务的入口，不得由测试或其他脚本自动启动。
- 高风险接口必须保持确认词机制，不要改成一键执行。
- 危险动作可以保留 resource wrapper 和测试，但不要默认暴露成无确认的客户演示快捷入口。
- 非必填输入为空时，应从请求对象里省略，不要传空字符串，不要补默认值。

## 实现规则

- 新增通用 endpoint 时，优先放在 `src/resources/<resource>/api.ts`。
- 新增渠道专属流程时，优先放在 `src/channels/<provider>`。
- 新增客户演示命令时，先确认它是否属于安全演示范围，再修改 `package.json` scripts 和对应测试。
- `UnifyPortRequest.query` 必须交给统一 client 通过 `URLSearchParams` 编码，不要在 resource wrapper 中手写 query string。
- 路径参数替换应使用 `replacePathParameter`，不要在多个 resource 中重复拼装相同规则。
- 请求体字段必须严格对应当前接口示例或已有类型。
- 不要增加无请求依据的校验、异常、兜底或易用性逻辑。

## 测试与验证

优先使用以下命令验证：

- `pnpm lint`
- `pnpm format:check`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm check`
- `git diff --check`

范围很小的改动可以先运行相关 Vitest 用例，再在最终交付前选择合适的全量检查。修改 CLI 菜单、脚本或 endpoint 覆盖时，必须同步检查 `tests/cli/*`。修改 resource wrapper 时，必须同步检查 `tests/resources/*`。修改 Webhook 行为时，必须同步检查 `tests/webhook/*`。

## 格式与类型规则

- Node.js 版本要求为 `>=20.19.0`。
- 包管理器为 `pnpm@11.7.0`。
- 项目使用 ESM，导入本地 TypeScript 编译产物时保留 `.js` 后缀。
- TypeScript 运行在 `strict` 模式。
- 类型导入必须使用 `import type`。
- Prettier 配置为 2 空格、双引号、分号、无尾随逗号、`printWidth` 100。
- 不要手动编辑 `dist` 产物。

## Git 工作区规则

- 开始修改前先看 `git status --short`。
- 当前仓库可能存在用户未提交变更，不能回滚、覆盖或整理这些变更。
- 不要使用 `git reset --hard`、`git checkout --` 等破坏性命令，除非用户明确要求。
- 最终汇报必须说明修改了哪些文件、运行了哪些验证、哪些验证未运行。
