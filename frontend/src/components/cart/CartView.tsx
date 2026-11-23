"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function CartView() {
  const router = useRouter();
  const { items, loading, updateQuantity, removeItems } = useCartStore();
  // lưu danh sách sách BỎ chọn -> mặc định tất cả đều được chọn
  const [unchecked, setUnchecked] = useState<string[]>([]);

  const selected = items.filter((i) => !unchecked.includes(i.bookId));
  const selectedTotal = selected.reduce((s, i) => s + i.lineTotal, 0);
  const allChecked = items.length > 0 && selected.length === items.length;

  const toggle = (id: string) =>
    setUnchecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => setUnchecked(allChecked ? items.map((i) => i.bookId) : []);

  // UC-12 BR2: luôn hỏi xác nhận trước khi xoá
  const confirmRemove = async (ids: string[], message: string) => {
    if (ids.length === 0) return;
    if (window.confirm(message)) await removeItems(ids);
  };

  const decrease = (bookId: string, quantity: number, title: string) => {
    if (quantity <= 1) {
      // UC-12 (2a): giảm về 0 -> hỏi xác nhận xoá
      confirmRemove([bookId], `Xoá “${title}” khỏi giỏ hàng?`);
      return;
    }
    updateQuantity(bookId, quantity - 1);
  };

  if (loading && items.length === 0) {
    return <div className="py-20 text-center text-sm">Đang tải giỏ hàng...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShoppingCart className="text-muted-foreground mx-auto size-16" />
        <h1 className="mt-4 text-xl font-bold">Giỏ hàng của bạn đang trống</h1>
        <p className="text-muted-foreground mt-2 text-sm">Hãy chọn vài cuốn sách yêu thích nhé.</p>
        <Button asChild className="mt-6">
          <Link href="/books">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* danh sách sách */}
        <div className="space-y-3">
          <div className="bg-card flex items-center justify-between rounded-xl border px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-[hsl(var(--primary))]"
                checked={allChecked}
                onChange={toggleAll}
              />
              Chọn tất cả
            </label>
            <button
              disabled={selected.length === 0}
              onClick={() =>
                confirmRemove(
                  selected.map((i) => i.bookId),
                  `Xoá ${selected.length} sản phẩm đã chọn khỏi giỏ hàng?`
                )
              }
              className="text-destructive flex items-center gap-1 text-sm hover:underline disabled:opacity-40"
            >
              <Trash2 className="size-4" /> Xoá đã chọn
            </button>
          </div>

          {items.map((item) => (
            <div key={item.bookId} className="bg-card flex gap-4 rounded-xl border p-4">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-[hsl(var(--primary))]"
                checked={!unchecked.includes(item.bookId)}
                onChange={() => toggle(item.bookId)}
                aria-label={`Chọn ${item.title}`}
              />

              <div className="bg-muted h-28 w-20 shrink-0 overflow-hidden rounded-md">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    <ImageOff className="size-6" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div>
                  <h2 className="line-clamp-2 font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground text-sm">{item.author}</p>
                  <p className="mt-1 text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => decrease(item.bookId, item.quantity, item.title)}
                      aria-label="Giảm số lượng"
                    >
                      <Minus />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                    >
                      <Plus />
                    </Button>
                    {item.quantity >= item.stock && (
                      <span className="text-muted-foreground ml-2 text-xs">Đã đạt tối đa tồn kho</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(item.lineTotal)}</span>
                    <button
                      onClick={() => confirmRemove([item.bookId], `Xoá “${item.title}” khỏi giỏ hàng?`)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Xoá"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* tóm tắt đơn */}
        <aside className="bg-card h-fit space-y-4 rounded-xl border p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Đã chọn</span>
            <span>{selected.length} sản phẩm</span>
          </div>
          <div className="flex justify-between border-t pt-4">
            <span className="font-semibold">Tạm tính</span>
            <span className="text-xl font-bold text-primary">{formatPrice(selectedTotal)}</span>
          </div>
          <p className="text-muted-foreground text-xs">Mã giảm giá và phương thức thanh toán chọn ở bước đặt hàng.</p>
          <Button
            className="w-full"
            size="lg"
            disabled={selected.length === 0}
            onClick={() => router.push(`/checkout?items=${selected.map((i) => i.bookId).join(",")}`)}
          >
            Tiến hành đặt hàng
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/books">Tiếp tục mua sắm</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
