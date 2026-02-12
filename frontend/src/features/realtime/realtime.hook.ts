import { useEffect } from "react";
import { io } from "socket.io-client";
import { queryClient } from "../../app/query-client";
import { env } from "../../utils/env";
import { useAuthUser } from "../../features/auth/auth.hooks";

const socket = io(env.socketUrl, { autoConnect: false, withCredentials: true });

export const useRealtime = (): void => {
  const user = useAuthUser();

  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.connect();
    socket.emit("parking:join", user.id);

    const onSlot = (): void => {
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    };

    const onBooking = (): void => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    };

    const onNotification = (): void => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("parking:slot", onSlot);
    socket.on("parking:booking", onBooking);
    socket.on("parking:notification", onNotification);

    return () => {
      socket.off("parking:slot", onSlot);
      socket.off("parking:booking", onBooking);
      socket.off("parking:notification", onNotification);
    };
  }, [user]);
};
