import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { slotApi } from "./slot.api";

export const useSlots = (
  vehicleType?: string,
  page = 1,
  limit = 12,
  lotName?: string,
) =>
  useQuery({
    queryKey: ["slots", vehicleType, page, limit, lotName],
    queryFn: () => slotApi.list(vehicleType, page, limit, lotName),
    refetchInterval: 500,
    refetchIntervalInBackground: true,
  });

export const useCreateSlot = () =>
  useMutation({
    mutationFn: slotApi.create,
    onSuccess: async () => {
      toast.success("Slot created");
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Unable to create slot";
      toast.error(message);
    },
  });

export const useUpdateSlot = () =>
  useMutation({
    mutationFn: ({
      slotId,
      payload,
    }: {
      slotId: string;
      payload: Parameters<typeof slotApi.update>[1];
    }) => slotApi.update(slotId, payload),
    onSuccess: async () => {
      toast.success("Slot updated");
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Unable to update slot";
      toast.error(message);
    },
  });

export const useDeleteSlot = () =>
  useMutation({
    mutationFn: slotApi.remove,
    onSuccess: async () => {
      toast.success("Slot deleted");
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Unable to delete slot";
      toast.error(message);
    },
  });
