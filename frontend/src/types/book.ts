export interface Book {
  _id: string;
  title: string;
  author?: string;
  price: number;
  stock: number;
  image?: string;
  year?: number;
}

export interface Category {
  _id: string;
  name: string;
  count: number;
}

export interface BookListParams {
  q?: string;
  categories?: string; // "TL001,TL002"
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookDetail extends Book {
  description?: string;
  isbn?: string;
  publisher?: string;
  categories: { _id: string; name: string }[];
}

export interface BookDetailResponse {
  book: BookDetail;
  related: Book[];
}
export interface Review {
  _id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface MyReviewStatus {
  canReview: boolean;
  myReview: { _id: string; rating: number; content: string } | null;
}