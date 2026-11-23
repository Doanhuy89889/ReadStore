import api from "@/lib/axios";
import type { CreateOrderPayload, Order } from "@/types/order";

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> =>
    (await api.post("/orders", payload)).data.order,

  getOrder: async (id: string): Promise<Order> =>
    (await api.get(`/orders/${encodeURIComponent(id)}`)).data.order,

  switchToCod: async (id: string): Promise<Order> =>
    (await api.post(`/orders/${encodeURIComponent(id)}/switch-cod`)).data.order,
};
