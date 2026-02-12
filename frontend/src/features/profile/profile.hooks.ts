import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "../../app/query-client";
import { profileApi } from "./profile.api";

export const useMyProfile = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.myProfile,
  });

export const useUpdateMyProfile = () =>
  useMutation({
    mutationFn: profileApi.updateMyProfile,
    onSuccess: async () => {
      toast.success("Profile updated");
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles", "admin"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

export const useAdminProfiles = (role?: "user" | "security") =>
  useQuery({
    queryKey: ["profiles", "admin", role],
    queryFn: () => profileApi.listAdminProfiles(role),
  });

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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
