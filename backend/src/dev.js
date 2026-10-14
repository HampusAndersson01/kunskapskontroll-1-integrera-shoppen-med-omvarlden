import { loadProjectEnv } from "./load-env.js";

loadProjectEnv();
await import("./server.js");
