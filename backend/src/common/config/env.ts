import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(10),
  ACCESS_TOKEN_SECRET: z.string().min(16),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  STRIPE_SECRET_KEY: z.string().min(16),
  STRIPE_WEBHOOK_SECRET: z.string().min(16).optional(),
  BOOKING_QR_SECRET: z.string().min(16),
  MAIL_SERVICE: z.string().min(2),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(4),
  TRIGGER_DEV_WEBHOOK_URL: z.string().url().optional(),
  APP_BASE_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const env = parsed.data;
