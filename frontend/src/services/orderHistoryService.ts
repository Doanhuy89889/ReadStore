import api from "@/lib/axios";
import type { OrderListResponse } from "@/types/orderList";

export const orderHistoryService = {
  getMyOrders: async (params: { status?: string; page?: number; limit?: number }): Promise<OrderListResponse> =>
    (await api.get("/orders", { params })).data,

  cancelOrder: async (id: string): Promise<{ message: string; needRefund: boolean }> =>
    (await api.post(`/orders/${encodeURIComponent(id)}/cancel`)).data,
};
