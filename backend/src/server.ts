import http from "node:http";
import { SyncController } from "./controllers/syncController.js";
import { BackendStorageService } from "./services/storageService.js";
import { AssistantController } from "./assistant/assistantController.js";
import { SyncPayload, DeltaSyncPayload } from "./types/index.js";

// Load environment variables from .env if present (native Node.js 20+)
try {
  process.loadEnvFile();
} catch {
  // .env file is optional in development/test environments
}

const PORT = parseInt(process.env.PORT || "5000", 10);
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB limit for JSON sync

// Allowed origins for CORS: localhost development and configurable FRONTEND_ORIGIN / FRONTEND_URL / ALLOWED_ORIGINS
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const customAllowed = [
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
]
  .filter((s): s is string => Boolean(s && s.trim()))
  .map((o) => o.trim().replace(/\/+$/, ""));

const ALLOWED_ORIGINS = new Set([...DEFAULT_ALLOWED_ORIGINS, ...customAllowed]);

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

  const normalizedOrigin = origin.replace(/\/+$/, "");

  // Validate cross-origin against allowlist
  if (ALLOWED_ORIGINS.has(normalizedOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
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
  if ((req.method === "GET" || req.method === "HEAD") && (url.pathname === "/health" || url.pathname === "/api/health")) {
    const health = SyncController.getHealth();
    res.writeHead(200, { "Content-Type": "application/json" });
    if (req.method === "HEAD") {
      res.end();
    } else {
      res.end(JSON.stringify(health));
    }
    return;
  }

  // Assistant status
  if (req.method === "GET" && url.pathname === "/api/assistant/status") {
    const status = AssistantController.getStatus();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(status));
    return;
  }

  // Assistant Chat endpoint
  if (req.method === "POST" && url.pathname === "/api/assistant/chat") {
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
      // 1MB safety limit for assistant chat payloads
      if (body.length > 1024 * 1024) {
        isAborted = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Chat payload exceeds 1MB limit." }));
        req.destroy();
      }
    });

    req.on("error", (err) => {
      if (isAborted || res.writableEnded) return;
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Stream read error: " + err.message }));
    });

    req.on("end", async () => {
      if (isAborted || res.writableEnded) return;
      try {
        const payload = JSON.parse(body);
        const result = await AssistantController.handleChat(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
    });
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

  // Record-level Delta Sync endpoint
  if (req.method === "POST" && url.pathname === "/api/sync/delta") {
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
      if (body.length > MAX_PAYLOAD_BYTES) {
        isAborted = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Delta payload exceeds 5MB limit." }));
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
        const payload: DeltaSyncPayload = JSON.parse(body);
        const result = SyncController.handleDeltaSync(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
    });
    return;
  }

  // Sync / Upload backup (Monolithic full snapshot fallback)
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

// Process-level safety and cloud lifecycle handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("[SYDD Backend] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[SYDD Backend] Uncaught Exception:", error);
});

const gracefulShutdown = (signal: string) => {
  console.log(`[SYDD Backend] Received ${signal}. Closing HTTP server...`);
  server.close(() => {
    console.log("[SYDD Backend] HTTP server closed gracefully.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[SYDD Backend] Graceful shutdown timed out, exiting.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
