export type PaymentMethod = "COD" | "SEPAY";

export interface OrderItem {
  bookId: string;
  title: string;
  image?: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface PaymentInfo {
  bank: string;
  accountNumber: string;
  accountName?: string;
  content: string;
  amount: number;
  qrUrl: string;
}

export interface Order {
  _id: string;
  status: string; // Chờ thanh toán | Chờ duyệt | Đang xử lý | Đang giao | Hoàn thành | Đã huỷ
  paymentStatus: string; // Chưa thanh toán | Đã thanh toán | Đã hoàn tiền
  paymentMethod: PaymentMethod;
  address: string;
  phone: string;
  total: number;
  createdAt: string;
  expiresAt?: string;
  cancelReason?: string;
  items: OrderItem[];
  payment?: PaymentInfo;
}

export interface CreateOrderPayload {
  address: string;
  phone: string;
  paymentMethod: PaymentMethod;
  bookIds: string[];
}
