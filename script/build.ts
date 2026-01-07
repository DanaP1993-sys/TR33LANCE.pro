import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "express", "cors", "axios", "openai", "stripe", "uuid", "zod", "dotenv"
];

async function buildAll() {
  console.log("Cleaning dist folder...");
  await rm("dist", { recursive: true, force: true });

  console.log("Building client...");
  const clientStart = Date.now();
  await viteBuild();
  console.log(`Client build completed in ${Date.now() - clientStart}ms`);

  console.log("Building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  const serverStart = Date.now();
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "dist/server.js",
    define: {
      "process.env.NODE_ENV": `"${process.env.NODE_ENV || "production"}"`,
    },
    minify: true,
    sourcemap: process.env.NODE_ENV !== "production",
    external: externals,
    logLevel: "info",
    banner: {
      js: `
/*
  © 2026 Dana Palmer. All rights reserved.
  Tree-Lance Platform
  Bundled server module (ESM)
*/
import { createRequire } from "module"; const require = createRequire(import.meta.url);
    `,
    },
  });

  console.log(`Server build completed in ${Date.now() - serverStart}ms`);
  console.log("✅ Tree-Lance build complete! Ready for deployment.");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
