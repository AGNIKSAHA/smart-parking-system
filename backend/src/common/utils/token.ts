import { createHash, randomBytes } from "node:crypto";

export const generateToken = (): string => randomBytes(32).toString("hex");
export const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");
