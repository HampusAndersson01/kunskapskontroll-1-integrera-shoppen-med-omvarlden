import { loadProjectEnv } from "./load-env.js";

loadProjectEnv();
await import("./db/migrate.js");
