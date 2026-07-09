// Splice a TypeScript v6 Node API into the installed typescript@7 package.
//
// Background: typescript@7 is a native compiler that ships NO programmatic API
// (require("typescript") exposes only `version`). The `tsc` binary shells out to a
// native executable and is unaffected by this script. However, JS tooling such as
// typescript-eslint needs the full v6 Node API via require("typescript").
//
// This script keeps the native v7 `tsc` binary intact and merely repoints the
// package's main entry (".") at a shim that re-exports the v6 API provided by
// @typescript/old (installed as a dependency of @typescript/typescript6). That lets
// ESLint run on v6 while `tsc --noEmit` / `next build` type-check with v7.
//
// It is idempotent and safe to run on every install via the "postinstall" script.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function main() {
  const tsPkgPath = resolve(projectRoot, "node_modules/typescript/package.json");
  if (!existsSync(tsPkgPath)) return;

  const tsPkg = JSON.parse(readFileSync(tsPkgPath, "utf8"));
  const major = Number(String(tsPkg.version).split(".")[0]);
  if (major < 7) return; // Not the native TS7 layout; nothing to do.

  // The v6 API source must be present (provided by @typescript/typescript6).
  try {
    require.resolve("@typescript/old/package.json");
  } catch {
    console.warn(
      '[pin-eslint-typescript] @typescript/old not found; skipping v6 API splice. Run "npm install" again.'
    );
    return;
  }

  const shimPath = resolve(projectRoot, "node_modules/typescript/lib/eslint-typescript.cjs");
  mkdirSync(dirname(shimPath), { recursive: true });
  writeFileSync(shimPath, 'module.exports = require("@typescript/old");\n');

  const exports = tsPkg.exports || (tsPkg.exports = {});
  if (exports["."] === "./lib/eslint-typescript.cjs") return; // Already spliced.

  // Preserve every other export/subpath (e.g. ./unstable/*) and the "imports" map
  // that `tsc` relies on (#getExePath); only repoint the main entry.
  exports["."] = "./lib/eslint-typescript.cjs";
  writeFileSync(tsPkgPath, JSON.stringify(tsPkg, null, 2) + "\n");

  console.log(
    '[pin-eslint-typescript] require("typescript") -> @typescript/old (v6 API); native tsc remains v7.'
  );
}

main();
