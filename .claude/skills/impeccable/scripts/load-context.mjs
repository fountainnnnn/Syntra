import { spawnSync } from "node:child_process";

const loaderPath = "C:/Users/Spiral Crust/.codex/skills/impeccable/scripts/load-context.mjs";

const result = spawnSync(process.execPath, [loaderPath], {
  cwd: process.cwd(),
  env: process.env,
  encoding: "utf8"
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}

if (result.stderr) {
  process.stderr.write(result.stderr);
}

process.exit(result.status ?? 1);
