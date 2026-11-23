import api from "@/lib/axios";
import type { Cart } from "@/types/cart";

export const cartService = {
  getCart: async (): Promise<Cart> => (await api.get("/cart")).data,

  addItem: async (bookId: string, quantity = 1): Promise<Cart> =>
    (await api.post("/cart/items", { bookId, quantity })).data,

  updateQuantity: async (bookId: string, quantity: number): Promise<Cart> =>
    (await api.patch(`/cart/items/${bookId}`, { quantity })).data,

  removeItems: async (bookIds: string[]): Promise<Cart> =>
    (await api.post("/cart/remove", { bookIds })).data,
};
