import api from "@/lib/axios"; // đổi cho đúng với project của bạn
import type { MyReviewStatus, ReviewListResponse } from "@/types/book";

export const reviewService = {
  getReviews: async (bookId: string, page = 1, limit = 5) => {
    const res = await api.get<ReviewListResponse>(`/reviews/book/${bookId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  getMyStatus: async (bookId: string) => {
    const res = await api.get<MyReviewStatus>(`/reviews/book/${bookId}/me`);
    return res.data;
  },

  submit: async (bookId: string, rating: number, content: string) => {
    const res = await api.post(`/reviews/book/${bookId}`, { rating, content });
    return res.data;
  },

  remove: async (reviewId: string) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  },
};