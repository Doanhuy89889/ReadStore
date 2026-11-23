import MainLayout from "@/components/layout/MainLayout";
import OrderView from "@/components/orders/OrderView";


export const metadata = { title: "Đơn hàng - ReadStore" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <MainLayout>
      <OrderView id={id} />
      
    </MainLayout>
  );
}
