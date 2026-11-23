"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, ImageOff, Minus, PackageSearch, Plus, ShieldCheck, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { bookService } from "@/services/bookService";
import type { BookDetailResponse } from "@/types/book";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { gradientBtn, gradientText } from "@/lib/ui";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import BookCard from "./BookCard";
import ReviewSection from "./ReviewSection";

export default function BookDetailView({ id }: { id: string }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);

  const [data, setData] = useState<BookDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    bookService
      .getBookById(id)
      .then(setData)
      .catch((e) => {
        console.error("Lỗi tải chi tiết sách:", e);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div className="bg-muted aspect-[2/3] animate-pulse rounded-3xl" />
        <div className="space-y-4">
          <div className="bg-muted h-8 w-3/4 animate-pulse rounded-xl" />
          <div className="bg-muted h-5 w-1/2 animate-pulse rounded-xl" />
          <div className="bg-muted h-24 w-full animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  // UC-10 (2a): sách không tồn tại -> báo lỗi và quay lại danh sách
  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-bold">Không tìm thấy sách</h1>
        <p className="text-muted-foreground mt-2 text-sm">Cuốn sách này không tồn tại hoặc đã ngừng bán.</p>
        <Button asChild className={cn("mt-6 rounded-xl", gradientBtn)}>
          <Link href="/books">Quay lại danh sách sách</Link>
        </Button>
      </div>
    );
  }

  const { book, related } = data;
  const outOfStock = book.stock <= 0;

  const requireLogin = () => {
    if (accessToken) return false;
    toast.info("Vui lòng đăng nhập để thêm sách vào giỏ hàng");
    router.push("/signin");
    return true;
  };

  const handleAdd = async () => {
    if (requireLogin()) return;
    await addItem(book._id, quantity);
  };

  const handleBuyNow = async () => {
    if (requireLogin()) return;
    const ok = await addItem(book._id, quantity);
    if (ok) router.push("/cart");
  };

  const info = (
    [
      ["Tác giả", book.author],
      ["Nhà xuất bản", book.publisher],
      ["Năm xuất bản", book.year],
      ["ISBN", book.isbn],
    ] as [string, string | number | undefined][]
  ).filter(([, v]) => v !== undefined && v !== "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* breadcrumb */}
      <nav className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1 text-sm">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="size-4" />
        <Link href="/books" className="hover:text-primary">Sách</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground line-clamp-1">{book.title}</span>
      </nav>

      <div className="grid gap-4 md:grid-cols-[minmax(0,380px)_1fr]">
        {/* trái: bìa sách, nút mua, chính sách */}
        <div className="bg-card self-start rounded-2xl border p-5">
          <div className="bg-muted/40 relative mx-auto aspect-[2/3] max-w-[320px] overflow-hidden rounded-lg border">
            {book.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.image} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <ImageOff className="size-16" />
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 rounded-xl"
              disabled={outOfStock}
              onClick={handleAdd}
            >
              <ShoppingCart /> Thêm vào giỏ
            </Button>
            <Button size="lg" className={cn("rounded-xl", gradientBtn)} disabled={outOfStock} onClick={handleBuyNow}>
              <Zap /> Mua ngay
            </Button>
          </div>

          <ul className="mt-5 space-y-3 border-t pt-4 text-sm">
            <li className="flex items-center gap-3">
              <CreditCard className="text-primary size-5 shrink-0" /> Thanh toán khi nhận hàng hoặc trực tuyến
            </li>
            <li className="flex items-center gap-3">
              <PackageSearch className="text-primary size-5 shrink-0" /> Theo dõi đơn hàng ngay trên website
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="text-primary size-5 shrink-0" /> Mật khẩu mã hoá, không lưu thông tin thẻ
            </li>
          </ul>
        </div>

        {/* phải: thông tin, chi tiết, mô tả */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border p-5 md:p-6">
            <h1 className="text-2xl font-bold md:text-3xl">{book.title}</h1>

            {book.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {book.categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/books?categories=${c._id}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className={cn("text-3xl font-bold", gradientText)}>{formatPrice(book.price)}</p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  outOfStock ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"
                )}
              >
                {outOfStock ? "Hết hàng" : `Còn hàng (${book.stock} cuốn)`}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4 border-t pt-5">
              <span className="text-sm font-medium">Số lượng</span>
              <div className="flex items-center rounded-full border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  disabled={outOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng"
                >
                  <Minus />
                </Button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  disabled={outOfStock || quantity >= book.stock}
                  onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                  aria-label="Tăng số lượng"
                >
                  <Plus />
                </Button>
              </div>
            </div>
          </div>

          {info.length > 0 && (
            <div className="bg-card rounded-2xl border p-5 md:p-6">
              <h2 className="mb-2 text-lg font-bold">Thông tin chi tiết</h2>
              <dl className="text-sm">
                {info.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[140px_1fr] gap-4 border-b py-3 last:border-b-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="bg-card rounded-2xl border p-5 md:p-6">
            <h2 className="mb-3 text-lg font-bold">Mô tả sách</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {book.description || "Chưa có mô tả cho cuốn sách này."}
            </p>
          </div>
        </div>
      </div>
      <ReviewSection bookId={book._id} />
      {/* sách liên quan */}
      {related.length > 0 && (
        <section className="bg-card mt-4 rounded-2xl border p-5 md:p-6">
          <h2 className="mb-5 text-lg font-bold">Sách liên quan</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
