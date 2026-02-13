import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { subscriptionApi } from "./subscription.api";
import { useAppSelector } from "../../app/redux-hooks";

export const useSubscriptions = () => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: subscriptionApi.mine,
    enabled: !!user,
  });
};

export const useCreateSubscription = () =>
  useMutation({
    mutationFn: subscriptionApi.create,
  });
export const useConfirmSubscription = () =>
  useMutation({
    mutationFn: subscriptionApi.confirm,
    onSuccess: async () => {
      toast.success("Subscription activated successfully");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

export const useSubscriptionQr = (subscriptionId?: string) => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["subscription-qr", subscriptionId],
    queryFn: () => subscriptionApi.getQr(subscriptionId!),
    enabled: !!subscriptionId && !!user,
  });
};
