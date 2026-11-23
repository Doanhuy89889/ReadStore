"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, Clock, Copy, ImageOff, XCircle } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";

const POLL_MS = 3000;

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function OrderView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [switching, setSwitching] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await orderService.getOrder(id));
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const waiting = order?.status === "Chờ thanh toán";

  // đang chờ thanh toán: hỏi server mỗi 3 giây + đếm ngược mỗi giây
  useEffect(() => {
    if (!waiting) return;
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [waiting, load]);

  const handleSwitchCod = async () => {
    if (!window.confirm("Đổi sang thanh toán khi nhận hàng (COD)?")) return;
    try {
      setSwitching(true);
      setOrder(await orderService.switchToCod(id));
      toast.success("Đã chuyển sang thanh toán khi nhận hàng");
    } catch (e) {
      toast.error(isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Không đổi được phương thức");
      load();
    } finally {
      setSwitching(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép");
    } catch {
      toast.error("Không sao chép được");
    }
  };

  if (loading) return <div className="py-20 text-center text-sm">Đang tải đơn hàng...</div>;

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-bold">Không tìm thấy đơn hàng</h1>
        <Button asChild className="mt-6">
          <Link href="/books">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  const cancelled = order.status === "Đã huỷ";
  const paid = order.paymentStatus === "Đã thanh toán";
  const remaining = order.expiresAt ? new Date(order.expiresAt).getTime() - now : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* banner trạng thái */}
      {waiting && order.payment ? (
        <section className="bg-card overflow-hidden rounded-xl border">
          <div className="bg-primary p-5 text-center text-primary-foreground">
            <p>Thanh toán đơn hàng {order._id}</p>
            <p className="text-3xl font-bold">{formatPrice(order.payment.amount)}</p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.payment.qrUrl}
              alt="QR chuyển khoản"
              className="mx-auto aspect-square w-60 rounded-lg border object-contain"
            />

            <div className="space-y-4">
              <p className="text-sm">Mở app ngân hàng → Quét QR → Xác nhận chuyển khoản.</p>

              <dl className="bg-muted/50 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-lg p-4 text-sm">
                <dt className="text-muted-foreground">Ngân hàng</dt>
                <dd className="font-semibold">{order.payment.bank}</dd>
                <span />
                <dt className="text-muted-foreground">Số tài khoản</dt>
                <dd className="font-semibold">{order.payment.accountNumber}</dd>
                <button onClick={() => copy(order.payment!.accountNumber)} aria-label="Sao chép số tài khoản">
                  <Copy className="size-4" />
                </button>
                {order.payment.accountName && (
                  <>
                    <dt className="text-muted-foreground">Chủ tài khoản</dt>
                    <dd className="font-semibold">{order.payment.accountName}</dd>
                    <span />
                  </>
                )}
                <dt className="text-muted-foreground">Số tiền</dt>
                <dd className="font-semibold">{formatPrice(order.payment.amount)}</dd>
                <button onClick={() => copy(String(order.payment!.amount))} aria-label="Sao chép số tiền">
                  <Copy className="size-4" />
                </button>
                <dt className="text-muted-foreground">Nội dung</dt>
                <dd className="font-semibold text-primary">{order.payment.content}</dd>
                <button onClick={() => copy(order.payment!.content)} aria-label="Sao chép nội dung">
                  <Copy className="size-4" />
                </button>
              </dl>

              <p className="text-destructive text-xs">
                Vui lòng giữ nguyên <b>số tiền</b> và <b>nội dung chuyển khoản</b> để hệ thống tự xác nhận.
              </p>

              <div className="flex items-center gap-2 rounded-lg bg-amber-100 p-3 text-sm font-semibold text-amber-800">
                <Clock className="size-4" />
                Đang chờ thanh toán · còn {formatCountdown(remaining)}
              </div>

              <Button variant="outline" disabled={switching} onClick={handleSwitchCod}>
                Đổi sang thanh toán khi nhận hàng (COD)
              </Button>
            </div>
          </div>
        </section>
      ) : cancelled ? (
        <section className="flex items-center gap-3 rounded-xl bg-red-50 p-5 text-red-800">
          <XCircle className="size-8 shrink-0" />
          <div>
            <p className="text-lg font-bold">Đơn hàng đã huỷ</p>
            {order.cancelReason && <p className="text-sm">Lý do: {order.cancelReason}</p>}
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-xl bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="size-8 shrink-0" />
          <div>
            <p className="text-lg font-bold">{paid ? "Thanh toán thành công!" : "Đặt hàng thành công!"}</p>
            <p className="text-sm">
              {paid
                ? "Cảm ơn bạn, đơn hàng đang chờ nhân viên duyệt."
                : "Đơn hàng đang chờ nhân viên duyệt. Bạn thanh toán tiền mặt khi nhận hàng."}
            </p>
          </div>
        </section>
      )}

      {/* chi tiết đơn */}
      <section className="bg-card mt-6 rounded-xl border p-5">
        <h2 className="mb-4 text-lg font-bold">Chi tiết đơn hàng</h2>

        <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">Mã đơn</dt>
          <dd className="font-semibold">{order._id}</dd>
          <dt className="text-muted-foreground">Ngày đặt</dt>
          <dd>{new Date(order.createdAt).toLocaleString("vi-VN")}</dd>
          <dt className="text-muted-foreground">Trạng thái đơn</dt>
          <dd className="font-semibold">{order.status}</dd>
          <dt className="text-muted-foreground">Thanh toán</dt>
          <dd>
            {order.paymentMethod === "COD" ? "Khi nhận hàng (COD)" : "Chuyển khoản QR (SePay)"} ·{" "}
            <span className={paid ? "font-semibold text-emerald-600" : "font-semibold"}>{order.paymentStatus}</span>
          </dd>
          <dt className="text-muted-foreground">Người nhận (SĐT)</dt>
          <dd>{order.phone}</dd>
          <dt className="text-muted-foreground">Địa chỉ giao hàng</dt>
          <dd>{order.address}</dd>
        </dl>

        <ul className="mt-5 divide-y border-t">
          {order.items.map((i) => (
            <li key={i.bookId} className="flex gap-3 py-3">
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
          <span className="font-semibold">Tổng tiền</span>
          <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
        </div>
      </section>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link href="/books">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
