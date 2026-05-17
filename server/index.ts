import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { registerRoutes } from "./routes.js";
import { ensureState } from "./store/state.js";

const app = express();

const allowedLocalOrigins = new Set([
  config.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedLocalOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

registerRoutes(app);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  console.error(`[syntra] ${message}`);
  res.status(500).json({ error: { code: "internal_error", message } });
});

ensureState();

app.listen(config.port, () => {
  console.log(`[syntra] Express API listening on http://localhost:${config.port}`);
});
