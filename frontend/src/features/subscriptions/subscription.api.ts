import { http } from "../../api/http";
import type { ApiResponse } from "../../types/domain";

export interface SubscriptionItem {
  id: string;
  vehicleNumber?: string;
  planName: string;
  monthlyAmount: number;
  startsAt: string;
  endsAt: string;
  status: string;
}

export const subscriptionApi = {
  async create(payload: {
    vehicleId: string;
    planName: string;
    monthlyAmount: number;
    startsAt: string;
    slotId?: string;
  }): Promise<{ clientSecret: string; amount: number }> {
    const res = await http.post<
      ApiResponse<{ clientSecret: string; amount: number }>
    >("/subscriptions", payload);
    return res.data.data;
  },

  async confirm(paymentIntentId: string): Promise<void> {
    await http.post("/subscriptions/confirm", { paymentIntentId });
  },

  async mine(): Promise<SubscriptionItem[]> {
    const res =
      await http.get<ApiResponse<SubscriptionItem[]>>("/subscriptions/me");
    return res.data.data;
  },

  async cancel(subscriptionId: string): Promise<void> {
    await http.post(`/subscriptions/${subscriptionId}/cancel`);
  },
};
