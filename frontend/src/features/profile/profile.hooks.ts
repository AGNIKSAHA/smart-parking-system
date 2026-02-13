import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { profileApi } from "./profile.api";
import { useAppSelector } from "../../app/redux-hooks";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    return String(error.response.data.message);
  }
  return fallback;
};

export const useMyProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.myProfile,
    enabled: !!user,
  });
};

export const useUpdateMyProfile = () =>
  useMutation({
    mutationFn: profileApi.updateMyProfile,
    onSuccess: async () => {
      toast.success("Profile updated");
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles", "admin"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    },
  });

export const useAdminProfiles = (role?: "user" | "security") => {
  const user = useAppSelector((state) => state.auth.user);
  return useQuery({
    queryKey: ["profiles", "admin", role],
    queryFn: () => profileApi.listAdminProfiles(role),
    enabled: !!user,
  });
};

export const useToggleUserStatus = () =>
  useMutation({
    mutationFn: (variables: { userId: string; isActive: boolean }) =>
      profileApi.toggleStatus(variables.userId, variables.isActive),
    onSuccess: async (_, variables) => {
      toast.success(
        `User ${variables.isActive ? "activated" : "suspended"} successfully`,
      );
      await queryClient.invalidateQueries({ queryKey: ["profiles", "admin"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update status"));
    },
  });
