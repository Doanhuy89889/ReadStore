export interface OrderSummary {
  _id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: "COD" | "SEPAY";
  total: number;
  createdAt: string;
  itemCount: number;
  preview: { title: string; image?: string; quantity: number }[];
  moreCount: number;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
