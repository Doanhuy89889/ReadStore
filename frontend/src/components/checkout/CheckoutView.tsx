"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { ImageOff, QrCode, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { orderService } from "@/services/orderService";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

const METHODS: { value: PaymentMethod; title: string; desc: string; icon: typeof Truck }[] = [
  {
    value: "COD",
    title: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt cho người giao hàng khi nhận sách.",
    icon: Truck,
  },
  {
    value: "SEPAY",
    title: "Chuyển khoản QR (SePay)",
    desc: "Quét mã QR bằng app ngân hàng, hệ thống tự xác nhận. Giữ hàng 15 phút.",
    icon: QrCode,
  },
];

export default function CheckoutView() {
  const router = useRouter();
  const sp = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { items, fetchCart } = useCartStore();

  const ids = (sp.get("items") ?? "").split(",").filter(Boolean);

  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // luôn lấy giỏ hàng mới nhất khi vào trang (kể cả khi F5)
  useEffect(() => {
    fetchCart().finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // điền sẵn thông tin từ tài khoản
  useEffect(() => {
    if (!user) return;
    setPhone((p) => p || user.phone || "");
    setAddress((a) => a || user.address || "");
  }, [user]);

  // có ?items=... -> chỉ đặt các sách đó; không có (vd bấm nút "Thanh toán" ở header) -> đặt cả giỏ hàng
  const selected = ids.length ? items.filter((i) => ids.includes(i.bookId)) : items;
  const total = selected.reduce((s, i) => s + i.lineTotal, 0);

  const validate = () => {
    const e: { phone?: string; address?: string } = {};
    if (!address.trim()) e.address = "Vui lòng nhập địa chỉ giao hàng";
    if (!PHONE_REGEX.test(phone.trim())) e.phone = "Số điện thoại không hợp lệ (vd: 0912345678)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const order = await orderService.createOrder({
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod: method,
        bookIds: selected.map((i) => i.bookId),
      });
      await fetchCart(); // sách đã đặt được xoá khỏi giỏ
      router.replace(`/orders/${order._id}`);
    } catch (e) {
      const msg =
        isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Không đặt được hàng, vui lòng thử lại";
      toast.error(msg);
      fetchCart(); // cập nhật lại giỏ (tồn kho có thể đã đổi)
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <div className="py-20 text-center text-sm">Đang tải...</div>;

  if (selected.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-bold">Chưa có sản phẩm để đặt hàng</h1>
        <p className="text-muted-foreground mt-2 text-sm">Hãy chọn sách trong giỏ hàng trước nhé.</p>
        <Button asChild className="mt-6">
          <Link href="/cart">Về giỏ hàng</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Đặt hàng</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* thông tin nhận hàng */}
          <section className="bg-card space-y-4 rounded-xl border p-5">
            <h2 className="text-lg font-bold">Thông tin nhận hàng</h2>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại nhận hàng</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ giao hàng</Label>
              <Input
                id="address"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
            </div>
          </section>

          {/* phương thức thanh toán */}
          <section className="bg-card space-y-3 rounded-xl border p-5">
            <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
            {METHODS.map(({ value, title, desc, icon: Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  method === value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1 size-4 accent-[hsl(var(--primary))]"
                  checked={method === value}
                  onChange={() => setMethod(value)}
                />
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </label>
            ))}
          </section>
        </div>

        {/* tóm tắt đơn */}
        <aside className="bg-card h-fit space-y-4 rounded-xl border p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Đơn hàng ({selected.length} sản phẩm)</h2>

          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {selected.map((i) => (
              <li key={i.bookId} className="flex gap-3">
                <div className="bg-muted h-16 w-12 shrink-0 overflow-hidden rounded">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt={i.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <ImageOff className="size-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{i.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatPrice(i.price)} × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t pt-4">
            <span className="font-semibold">Tổng thanh toán</span>
            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
          </div>

          <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Đang xử lý..." : method === "COD" ? "Đặt hàng" : "Đặt hàng và thanh toán"}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/cart">Quay lại giỏ hàng</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
