import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { subscriptionApi } from "./subscription.api";

export const useSubscriptions = () =>
  useQuery({ queryKey: ["subscriptions"], queryFn: subscriptionApi.mine });

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
