import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** 以独立 npm 安装的发布产物核对路由，避免本地源码与 Demo 同时漂移而互相通过。 */
const sdkPath = process.argv[2];
assert.ok(sdkPath, "Pass the installed SDK dist/index.js path");
const sdk = await import(pathToFileURL(resolve(sdkPath)).href);
const metadata = sdk.deviceOperations as Record<string, { method: string; path: string }>;
assert.equal(Object.keys(metadata).length, 78);
const manifest = JSON.parse(await readFile(resolve(sdkPath, "../../package.json"), "utf8"));
assert.equal(manifest.version, "0.5.0");
const routes = new Set<string>();
for (const category of await readdir("src/resources", { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  const source = await readFile(`src/resources/${category.name}/api.ts`, "utf8");
  for (const block of source.split("export function ").slice(1)) {
    const method = /method: "(GET|POST|PATCH|DELETE)"/.exec(block);
    const path = /"(\/v1\/[^"\n]*)"/.exec(block);
    if (method !== null && path !== null) routes.add(`${method[1]} ${path[1]}`);
  }
}
for (const [id, operation] of Object.entries(metadata)) {
  assert.ok(routes.has(`${operation.method} ${operation.path}`), `Missing released route ${id}`);
}
console.log("Published SDK 0.5.0: all 78 routes have Demo wrappers");
