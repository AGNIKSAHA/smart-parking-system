import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { bookingApi } from "./booking.api";

export const useBookings = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ["bookings", page, limit],
    queryFn: () => bookingApi.listMine(page, limit),
  });
export const useSecurityScanEvents = (enabled: boolean) =>
  useQuery({
    queryKey: ["bookings", "scans"],
    queryFn: bookingApi.securityScans,
    enabled,
  });

export const useCancelBooking = () =>
  useMutation({
    mutationFn: bookingApi.cancel,
    onSuccess: async () => {
      toast.success("Booking cancelled");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

export const useCreateBooking = () =>
  useMutation({
    mutationFn: bookingApi.create,
    onSuccess: async () => {
      toast.success("Booking created");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ?? "Unable to create booking";
      toast.error(message);
    },
  });

export const useScanBooking = () =>
  useMutation({
    mutationFn: bookingApi.scan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings", "scans"] });
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });

export const useConfirmPayment = () =>
  useMutation({
    mutationFn: ({
      bookingId,
      paymentIntentId,
    }: {
      bookingId: string;
      paymentIntentId?: string;
    }) => bookingApi.confirmPayment(bookingId, paymentIntentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ?? "Unable to confirm payment";
      toast.error(message);
    },
  });
