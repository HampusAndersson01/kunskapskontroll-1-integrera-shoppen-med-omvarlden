import http from "node:http";
import https from "node:https";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT ?? 8080);
const backendUrl = new URL(process.env.BACKEND_URL ?? "http://backend:3000");
const backendTransport = backendUrl.protocol === "https:" ? https : http;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
};

http.createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname === "/health") {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end("ok");
    return;
  }
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const proxyRequest = backendTransport.request(
      {
        hostname: backendUrl.hostname,
        port: backendUrl.port || (backendUrl.protocol === "https:" ? 443 : 80),
        method: request.method,
        path: request.url,
        headers: { ...request.headers, host: backendUrl.host },
      },
      (backendResponse) => {
        response.writeHead(backendResponse.statusCode ?? 502, backendResponse.headers);
        backendResponse.pipe(response);
      },
    );
    proxyRequest.setTimeout(15000, () => proxyRequest.destroy(new Error("API request timed out.")));
    proxyRequest.on("error", (error) => {
      console.error("API proxy request failed:", error.message);
      if (response.headersSent) {
        response.destroy(error);
      } else {
        response.writeHead(502, { "content-type": "application/json; charset=utf-8" })
          .end(JSON.stringify({ error: "The API is temporarily unavailable." }));
      }
    });
    request.pipe(proxyRequest);
    return;
  }

  const requestedPath = path.normalize(pathname).replace(/^([/\\]|\.\.(?:[/\\]|$))+/g, "");
  let filePath = path.join(root, requestedPath);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    filePath = path.join(root, "index.html");
  }

  try {
    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] ?? "application/octet-stream",
      "cache-control": path.basename(filePath) === "index.html" ? "no-cache" : "public, max-age=31536000, immutable",
    }).end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, "0.0.0.0", () => console.log(`Shop frontend listening on port ${port}`));
