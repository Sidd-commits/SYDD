import http from "node:http";
import { SyncController } from "./controllers/syncController.js";
import { BackendStorageService } from "./services/storageService.js";
import { SyncPayload } from "./types/index.js";

const PORT = parseInt(process.env.PORT || "5000", 10);
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB limit for JSON sync

// Allowed origins for CORS: localhost development and configurable FRONTEND_ORIGIN
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const envAllowed = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];
const ALLOWED_ORIGINS = new Set([...DEFAULT_ALLOWED_ORIGINS, ...envAllowed]);

/**
 * Applies security headers to all HTTP responses.
 */
const setSecurityHeaders = (res: http.ServerResponse) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
};

/**
 * Validates origin and applies CORS headers.
 * Returns true if request is allowed, false if rejected.
 */
const handleCors = (req: http.IncomingMessage, res: http.ServerResponse): boolean => {
  const origin = req.headers.origin;

  // Same-origin, loopback CLI, or tools without an Origin header
  if (!origin) {
    return true;
  }

  // Validate cross-origin against allowlist
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
    return true;
  }

  // Reject untrusted cross-origin requests
  return false;
};

const server = http.createServer((req, res) => {
  setSecurityHeaders(res);

  const corsAllowed = handleCors(req, res);
  if (!corsAllowed) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden: Cross-origin request not allowed from this origin." }));
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Safe URL parsing
  let url: URL;
  try {
    url = new URL(req.url || "/", "http://127.0.0.1");
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Malformed request URL" }));
    return;
  }

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
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      res.writeHead(415, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unsupported Media Type: Content-Type must be application/json" }));
      return;
    }

    let isAborted = false;
    let body = "";

    req.on("data", (chunk) => {
      if (isAborted) return;
      body += chunk;
      // Cap at MAX_PAYLOAD_BYTES to prevent memory exhaustion and DoS
      if (body.length > MAX_PAYLOAD_BYTES) {
        isAborted = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload exceeds 5MB limit." }));
        req.destroy();
      }
    });

    req.on("error", (err) => {
      if (isAborted || res.writableEnded) return;
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Stream read error: " + err.message }));
    });

    req.on("end", () => {
      if (isAborted || res.writableEnded) return;

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

BackendStorageService.init();

server.listen(PORT, () => {
  console.log(`SYDD Backend Service listening on port ${PORT}`);
});
