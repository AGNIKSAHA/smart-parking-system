import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../app/query-client";
import { notificationApi } from "./notification.api";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications", "list"],
    queryFn: notificationApi.list,
    refetchOnMount: true,
  });

export const useUnreadCountQuery = () =>
  useQuery({
    queryKey: ["notifications", "count"],
    queryFn: notificationApi.unreadCount,
    staleTime: 60000,
  });

export const useUnreadCount = (): number => {
  const query = useUnreadCountQuery();
  return query.data ?? 0;
};

export const useMarkRead = () =>
  useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
