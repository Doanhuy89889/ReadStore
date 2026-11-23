"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Book } from "@/types/book";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { gradientBg, gradientBtn } from "@/lib/ui";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";

export default function BookCard({ book, badge }: { book: Book; badge?: string }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = async () => {
    // UC-11 (1a): khách vãng lai phải đăng nhập mới thêm được vào giỏ
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để thêm sách vào giỏ hàng");
      router.push("/signin");
      return;
    }
    await addItem(book._id, 1);
  };

  const href = `/books/${book._id}`;

  return (
    <div className="bg-card group flex flex-col overflow-hidden rounded-xl border transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden p-3">
        {book.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.image}
            alt={book.title}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <ImageOff className="size-10" />
          </div>
        )}

        {badge && (
          <span className={cn("absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow", gradientBg)}>
            {badge}
          </span>
        )}
        {book.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white backdrop-blur-[2px]">
            Hết hàng
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
        <Link href={href}>
          <h3 title={book.title} className="line-clamp-2 text-sm leading-snug transition hover:text-primary">
            {book.title}
          </h3>
        </Link>
        {book.author && <p className="text-muted-foreground line-clamp-1 text-xs">{book.author}</p>}

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-red-700">{formatPrice(book.price)}</p>
          <Button
            size="icon"
            className={cn("size-9 shrink-0 rounded-full", gradientBtn)}
            disabled={book.stock <= 0}
            onClick={handleAdd}
            aria-label="Thêm vào giỏ"
            title="Thêm vào giỏ"
          >
            <ShoppingCart />
          </Button>
        </div>

        {book.stock > 0 && book.stock <= 5 && (
          <p className="text-xs text-orange-700">Chỉ còn {book.stock} cuốn</p>
        )}
      </div>
    </div>
  );
}
