import api from "@/lib/axios";
import type {
  Book,
  BookDetailResponse,
  BookListParams,
  BookListResponse,
  Category,
} from "@/types/book";

export const bookService = {
  getNewBooks: async (limit = 8): Promise<Book[]> => {
    const res = await api.get("/books/new", { params: { limit } });
    return res.data.books;
  },

  getBooks: async (params: BookListParams): Promise<BookListResponse> => {
    const res = await api.get("/books", { params });
    return res.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get("/books/categories");
    return res.data.categories;
  },

  getBookById: async (id: string): Promise<BookDetailResponse> => {
    const res = await api.get(`/books/${encodeURIComponent(id)}`);
    return res.data;
  },
};