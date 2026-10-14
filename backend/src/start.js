import { spawn, spawnSync } from "node:child_process";
import { loadProjectEnv } from "./load-env.js";

loadProjectEnv();

const migration = spawnSync(process.execPath, ["src/db/migrate.js"], { stdio: "inherit" });
if (migration.status !== 0) process.exit(migration.status ?? 1);

const server = spawn(process.execPath, ["src/server.js"], { stdio: "inherit" });
process.on("SIGTERM", () => server.kill("SIGTERM"));
process.on("SIGINT", () => server.kill("SIGINT"));
server.on("exit", (code) => process.exit(code ?? 1));
