import http from "node:http";
import { SyncController } from "./controllers/syncController.js";
import { SyncPayload } from "./types/index.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

const setCorsHeaders = (res: http.ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  // Health check
  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/health")) {
    const health = SyncController.getHealth();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(health));
    return;
  }

  // Get latest backup
  if (req.method === "GET" && url.pathname === "/api/backup") {
    const backup = SyncController.getLatestBackup();
    if (!backup) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "No backup found." }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(backup));
    return;
  }

  // Sync / Upload backup
  if (req.method === "POST" && (url.pathname === "/api/sync" || url.pathname === "/api/backup")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Cap at 10MB to avoid memory exhaustion
      if (body.length > 10 * 1024 * 1024) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload exceeds 10MB limit." }));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        const payload: SyncPayload = JSON.parse(body);
        const result = SyncController.handleSync(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
    });
    return;
  }

  // 404 Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found", path: url.pathname }));
});

server.listen(PORT, () => {
  console.log(`SYDD Backend Service listening on port ${PORT}`);
});
