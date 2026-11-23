"use client";
import CancelOrderButton from "./CancelOrderButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageOff, PackageOpen } from "lucide-react";
import { orderHistoryService } from "@/services/orderHistoryService";
import type { OrderListResponse } from "@/types/orderList";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/books/Pagination";
import StatusBadge from "./StatusBadge";

const TABS = ["Tất cả", "Chờ thanh toán", "Chờ duyệt", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã huỷ"];

export default function OrderList() {
  const [tab, setTab] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    orderHistoryService
      .getMyOrders({ status: tab === "Tất cả" ? undefined : tab, page, limit: 10 })
      .then(setData)
      .catch((e) => {
        console.error("Lỗi tải đơn hàng:", e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [tab, page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Đơn hàng của tôi</h1>

      {/* lọc theo trạng thái */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
              t === tab ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-muted h-36 animate-pulse rounded-xl" />)
        ) : error ? (
          <p className="text-muted-foreground py-12 text-center text-sm">Không tải được đơn hàng. Hãy kiểm tra backend.</p>
        ) : !data || data.orders.length === 0 ? (
          <div className="py-16 text-center">
            <PackageOpen className="text-muted-foreground mx-auto size-14" />
            <p className="text-muted-foreground mt-3 text-sm">Chưa có đơn hàng nào.</p>
            <Button asChild className="mt-5">
              <Link href="/books">Mua sắm ngay</Link>
            </Button>
          </div>
        ) : (
          data.orders.map((o) => (
            <div key={o._id} className="bg-card rounded-xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Đơn {o._id}</p>
                  <p className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <ul className="mt-4 space-y-2">
                {o.preview.map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="bg-muted h-14 w-10 shrink-0 overflow-hidden rounded">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">
                          <ImageOff className="size-4" />
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-1 flex-1 text-sm">{p.title}</span>
                    <span className="text-muted-foreground text-sm">x{p.quantity}</span>
                  </li>
                ))}
                {o.moreCount > 0 && <li className="text-muted-foreground text-xs">và {o.moreCount} sản phẩm khác...</li>}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {o.itemCount} cuốn · {o.paymentMethod === "COD" ? "COD" : "Chuyển khoản"} · {o.paymentStatus}
                  </span>
                  <p className="mt-1">
                    Tổng tiền: <b className="text-lg text-primary">{formatPrice(o.total)}</b>
                  </p>
                </div>
                <Button asChild variant={o.status === "Chờ thanh toán" ? "default" : "outline"} size="sm">
                  <Link href={`/orders/${o._id}`}>{o.status === "Chờ thanh toán" ? "Thanh toán ngay" : "Xem chi tiết"}</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
