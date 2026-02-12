import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtBase } from "../types/auth.js";

export interface AccessPayload extends JwtBase {
  type: "access";
}

export interface RefreshPayload extends JwtBase {
  type: "refresh";
  tokenId: string;
}

export const signAccess = (payload: JwtBase): string => {
  const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;
  return jwt.sign({ ...payload, type: "access" }, env.ACCESS_TOKEN_SECRET, { expiresIn });
};

export const signRefresh = (payload: JwtBase & { tokenId: string }): string => {
  const expiresIn = env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;
  return jwt.sign({ ...payload, type: "refresh" }, env.REFRESH_TOKEN_SECRET, { expiresIn });
};

export const verifyAccess = (token: string): AccessPayload =>
  jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessPayload;

export const verifyRefresh = (token: string): RefreshPayload =>
  jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshPayload;
