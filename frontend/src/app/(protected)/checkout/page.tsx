import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata = { title: "Đặt hàng - ReadStore" };

export default function CheckoutPage() {
  return (
    <MainLayout>
      {/* useSearchParams bắt buộc bọc trong Suspense */}
      <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
        <CheckoutView />
      </Suspense>
    </MainLayout>
  );
}
