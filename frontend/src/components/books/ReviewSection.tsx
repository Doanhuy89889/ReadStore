"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/services/reviewService";
import type { MyReviewStatus, ReviewListResponse } from "@/types/book";
import { cn } from "@/lib/utils";
import { gradientBtn, gradientText } from "@/lib/ui";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import Pagination from "./Pagination";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(size, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

export default function ReviewSection({ bookId }: { bookId: string }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MyReviewStatus | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setData(await reviewService.getReviews(bookId, page));
    } catch (e) {
      console.error("Lỗi tải đánh giá:", e);
    }
  }, [bookId, page]);

  const loadStatus = useCallback(async () => {
    if (!accessToken) {
      setStatus(null);
      return;
    }
    try {
      const s = await reviewService.getMyStatus(bookId);
      setStatus(s);
      setRating(s.myReview?.rating ?? 0);
      setContent(s.myReview?.content ?? "");
    } catch (e) {
      console.error("Lỗi kiểm tra quyền đánh giá:", e);
    }
  }, [bookId, accessToken]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.submit(bookId, rating, content.trim());
      toast.success(status?.myReview ? "Đã cập nhật đánh giá" : "Cảm ơn bạn đã đánh giá!");
      setPage(1);
      await Promise.all([loadReviews(), loadStatus()]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không gửi được đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!status?.myReview) return;
    if (!confirm("Xoá đánh giá của bạn?")) return;
    try {
      await reviewService.remove(status.myReview._id);
      toast.success("Đã xoá đánh giá");
      setRating(0);
      setContent("");
      setPage(1);
      await Promise.all([loadReviews(), loadStatus()]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không xoá được đánh giá");
    }
  };

  const shown = hover || rating;

  return (
    <section className="bg-card mt-4 rounded-2xl border p-5 md:p-6">
      <h2 className="mb-5 text-lg font-bold">Đánh giá sách</h2>

      {/* tổng quan */}
      {data && data.total > 0 && (
        <div className="mb-6 grid gap-6 border-b pb-6 sm:grid-cols-[160px_1fr]">
          <div className="text-center">
            <p className={cn("text-5xl font-bold", gradientText)}>{data.average}</p>
            <div className="mt-1 flex justify-center">
              <Stars value={data.average} />
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{data.total} đánh giá</p>
          </div>
          <div className="space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((s) => {
              const count = data.distribution[s];
              const pct = data.total ? (count / data.total) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{s} ★</span>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* form đánh giá */}
      <div className="bg-muted/30 mb-6 rounded-xl border p-4">
        {!accessToken ? (
          <p className="text-sm">
            <Link href="/signin" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>{" "}
            để đánh giá sách bạn đã mua.
          </p>
        ) : !status ? (
          <p className="text-muted-foreground text-sm">Đang kiểm tra...</p>
        ) : !status.canReview ? (
          <p className="text-muted-foreground text-sm">
            Chỉ khách hàng đã mua và nhận hàng thành công cuốn sách này mới có thể đánh giá.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {status.myReview ? "Đánh giá của bạn" : "Viết đánh giá của bạn"}
            </p>
            <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} sao`}
                >
                  <Star
                    className={cn(
                      "size-7 transition",
                      i <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
              className="bg-background focus:ring-primary/30 w-full resize-none rounded-xl border p-3 text-sm outline-none focus:ring-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{content.length}/1000</span>
              <div className="flex gap-2">
                {status.myReview && (
                  <Button variant="outline" className="rounded-xl" onClick={handleDelete}>
                    <Trash2 /> Xoá
                  </Button>
                )}
                <Button className={cn("rounded-xl", gradientBtn)} disabled={submitting} onClick={handleSubmit}>
                  {status.myReview ? "Cập nhật" : "Gửi đánh giá"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* danh sách */}
      {!data ? (
        <p className="text-muted-foreground text-sm">Đang tải đánh giá...</p>
      ) : data.reviews.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">Chưa có đánh giá nào cho cuốn sách này.</p>
      ) : (
        <>
          <ul className="divide-y">
            {data.reviews.map((r) => (
              <li key={r._id} className="flex gap-3 py-4">
                {r.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatarUrl} alt={r.userName} className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                    {r.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold">{r.userName}</span>
                    <Stars value={r.rating} size="size-3.5" />
                    <span className="text-muted-foreground text-xs">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">
                      Đã mua hàng
                    </span>
                  </div>
                  {r.content && (
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line break-words">{r.content}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}