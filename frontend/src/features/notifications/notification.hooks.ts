import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../app/query-client";
import { notificationApi } from "./notification.api";
import { useAppSelector } from "../../app/redux-hooks";

export const useNotifications = (limit = 20) => {
  const user = useAppSelector((state) => state.auth.user);
  return useInfiniteQuery({
    queryKey: ["notifications", "list", limit],
    queryFn: ({ pageParam = 1 }) => notificationApi.list(pageParam, limit),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnMount: true,
    enabled: !!user,
  });
};

export const useUnreadCountQuery = () => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["notifications", "count"],
    queryFn: notificationApi.unreadCount,
    staleTime: 60000,
    enabled: !!user,
  });
};

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
