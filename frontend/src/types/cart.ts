export interface CartItem {
  bookId: string;
  title: string;
  author?: string;
  image?: string;
  price: number;
  stock: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  count: number;
}
