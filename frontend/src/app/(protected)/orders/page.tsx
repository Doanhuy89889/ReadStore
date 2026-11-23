import MainLayout from "@/components/layout/MainLayout";
import OrderList from "@/components/orders/OrderList";


export const metadata = { title: "Đơn hàng của tôi - ReadStore" };

export default function OrdersPage() {
  return (
    <MainLayout>
      <OrderList />
      
    </MainLayout>
  );
}
