import { http } from "../../api/http";
import type { ApiResponse, Profile } from "../../types/domain";

export const profileApi = {
  async myProfile(): Promise<Profile> {
    const res = await http.get<ApiResponse<Profile>>("/profiles/me");
    return res.data.data;
  },

  async updateMyProfile(payload: {
    name: string;
    phoneNumber: string;
    address: string;
    governmentIdNumber: string;
  }): Promise<Profile> {
    const res = await http.patch<ApiResponse<Profile>>("/profiles/me", payload);
    return res.data.data;
  },

  async listAdminProfiles(role?: "user" | "security"): Promise<Profile[]> {
    const res = await http.get<ApiResponse<Profile[]>>("/profiles/admin", {
      params: role ? { role } : {},
    });
    return res.data.data;
  },

  async toggleStatus(
    userId: string,
    isActive: boolean,
  ): Promise<{ id: string; isActive: boolean }> {
    const res = await http.patch<
      ApiResponse<{ id: string; isActive: boolean }>
    >(`/profiles/admin/${userId}/status`, { isActive });
    return res.data.data;
  },
};
