import { createHmac } from "node:crypto";
import QRCode from "qrcode";
import { env } from "../../common/config/env.js";

interface BookingQrPayload {
  bookingId: string;
  userId: string;
  slotId: string;
  issuedAt: number;
}

interface UserQrPayload {
  userId: string;
  email: string;
  role: string;
  issuedAt: number;
}

const sign = (payload: string): string =>
  createHmac("sha256", env.BOOKING_QR_SECRET).update(payload).digest("hex");

export const createQr = async (
  payload: BookingQrPayload | UserQrPayload,
): Promise<{ token: string; imageDataUrl: string }> => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  const token = `${encoded}.${signature}`;
  const imageDataUrl = await QRCode.toDataURL(token, { margin: 1, width: 600 });
  return { token, imageDataUrl };
};

export const verifyQr = (token: string): BookingQrPayload | UserQrPayload => {
  const parts = token.split(".");
  if (parts.length !== 2) {
    throw new Error("Malformed qr token");
  }

  const [encoded, signature] = parts;
  if (!encoded || !signature) {
    throw new Error("Malformed qr token");
  }
  if (sign(encoded) !== signature) {
    throw new Error("Invalid qr signature");
  }

  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
};
