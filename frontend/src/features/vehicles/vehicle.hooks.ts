import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { vehicleApi } from "./vehicle.api";
import { useAppSelector } from "../../app/redux-hooks";

export const useVehicles = () => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleApi.list,
    enabled: !!user,
  });
};

export const useCreateVehicle = () =>
  useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: async () => {
      toast.success("Vehicle added");
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

export const useUpdateVehicle = () =>
  useMutation({
    mutationFn: ({
      vehicleId,
      payload,
    }: {
      vehicleId: string;
      payload: Parameters<typeof vehicleApi.update>[1];
    }) => vehicleApi.update(vehicleId, payload),
    onSuccess: async () => {
      toast.success("Vehicle updated");
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

export const useDeleteVehicle = () =>
  useMutation({
    mutationFn: vehicleApi.remove,
    onSuccess: async () => {
      toast.success("Vehicle deleted");
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
