"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { orderHistoryService } from "@/services/orderHistoryService";
import { Button } from "@/components/ui/button";

// UC-19: chỉ cho huỷ khi đơn ở các trạng thái này
const CANCELLABLE = ["Chờ thanh toán", "Chờ duyệt", "Đang xử lý"];

interface Props {
  orderId: string;
  status: string;
  onCancelled: () => void; // gọi lại để tải lại đơn hàng
}

export default function CancelOrderButton({ orderId, status, onCancelled }: Props) {
  const [loading, setLoading] = useState(false);

  if (!CANCELLABLE.includes(status)) return null;

  const handleCancel = async () => {
    // UC-19 bước 3: yêu cầu xác nhận trước khi huỷ
    if (!window.confirm(`Bạn chắc chắn muốn huỷ đơn ${orderId}?`)) return;

    try {
      setLoading(true);
      const res = await orderHistoryService.cancelOrder(orderId);
      toast.success(res.message);
    } catch (e) {
      toast.error(isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Không huỷ được đơn hàng");
    } finally {
      setLoading(false);
      onCancelled();
    }
  };

  return (
    <Button variant="outline" className="text-destructive" disabled={loading} onClick={handleCancel}>
      {loading ? "Đang huỷ..." : "Huỷ đơn hàng"}
    </Button>
  );
}
