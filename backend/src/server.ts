import "express-async-errors";

import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDb } from "./common/config/db.js";
import { env } from "./common/config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./common/middlewares/error.middleware.js";
import { apiRouter } from "./modules/routes.js";
import { initSocket } from "./modules/realtime/socket.js";
import { startExpiryWorker } from "./modules/notifications/expiry.worker.js";

import { handleStripeWebhook } from "./modules/payments/payment.controller.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, service: "smart-parking-backend" });
});

app.use("/api/v1", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const bootstrap = async (): Promise<void> => {
  await connectDb();
  startExpiryWorker();
  const server = createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`backend ready at http://localhost:${env.PORT}`);
  });
};

void bootstrap().catch((error: unknown) => {
  console.error("bootstrap failed", error);
  process.exit(1);
});
