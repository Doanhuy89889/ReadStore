import { create } from "zustand";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { cartService } from "@/services/cartService";
import type { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  subtotal: number;
  count: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (bookId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeItems: (bookIds: string[]) => Promise<void>;
  reset: () => void;
}

const errorMessage = (e: unknown) =>
  isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Có lỗi xảy ra, vui lòng thử lại";

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  count: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const cart = await cartService.getCart();
      set(cart);
    } catch (e) {
      console.error("Lỗi tải giỏ hàng:", e);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (bookId, quantity = 1) => {
    try {
      const cart = await cartService.addItem(bookId, quantity);
      set(cart);
      toast.success("Đã thêm sách vào giỏ hàng");
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    }
  },

  updateQuantity: async (bookId, quantity) => {
    try {
      const cart = await cartService.updateQuantity(bookId, quantity);
      set(cart);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  },

  removeItems: async (bookIds) => {
    try {
      const cart = await cartService.removeItems(bookIds);
      set(cart);
      toast.success("Đã xoá khỏi giỏ hàng");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  },

  reset: () => set({ items: [], subtotal: 0, count: 0, loading: false }),
}));
