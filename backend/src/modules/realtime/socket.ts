import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { env } from "../../common/config/env.js";

let io: Server | null = null;

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("parking:join", (userId: string) => {
      socket.join(`user:${userId}`);
    });
  });
};

export const emitSlot = (
  slotId: string,
  status: "available" | "reserved" | "occupied" | "maintenance",
): void => {
  io?.emit("parking:slot", { slotId, status });
};

export const emitBooking = (
  userId: string,
  bookingId: string,
  status: "reserved" | "checked_in" | "checked_out" | "cancelled" | "expired",
): void => {
  io?.to(`user:${userId}`).emit("parking:booking", { bookingId, status });
};
export const emitNotification = (userId: string): void => {
  io?.to(`user:${userId}`).emit("parking:notification", { unread: true });
};
