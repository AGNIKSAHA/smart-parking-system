import { http } from "../../api/http";
import type { ApiResponse, SessionUser } from "../../types/domain";

export const authApi = {
  async me(): Promise<SessionUser> {
    const res = await http.get<ApiResponse<{ user: SessionUser }>>("/auth/me");
    return res.data.data.user;
  },
  async login(payload: { email: string; password: string }): Promise<SessionUser> {
    const res = await http.post<ApiResponse<{ user: SessionUser }>>("/auth/login", payload);
    return res.data.data.user;
  },
  async register(payload: { name: string; email: string; password: string; role: "user" | "security" | "admin" }): Promise<void> {
    await http.post("/auth/register", payload);
  },
  async verifyEmail(token: string): Promise<void> {
    await http.post("/auth/verify-email", { token });
  },
  async resendVerification(email: string): Promise<void> {
    await http.post("/auth/resend-verification", { email });
  },
  async forgotPassword(email: string): Promise<void> {
    await http.post("/auth/forgot-password", { email });
  },
  async resetPassword(payload: { token: string; password: string }): Promise<void> {
    await http.post("/auth/reset-password", payload);
  },
  async logout(): Promise<void> {
    await http.post("/auth/logout");
  }
};
