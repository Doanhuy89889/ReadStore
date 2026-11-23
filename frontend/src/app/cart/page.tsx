import MainLayout from "@/components/layout/MainLayout";
import CartView from "@/components/cart/CartView";


export const metadata = { title: "Giỏ hàng - ReadStore" };

export default function CartPage() {
  return (
    <MainLayout>
      <CartView />
      
    </MainLayout>
  );
}