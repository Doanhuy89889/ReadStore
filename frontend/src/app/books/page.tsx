import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import BooksView from "@/components/books/BooksView";


export const metadata = { title: "Tất cả sách - ReadStore" };

export default function BooksPage() {
  return (
    <MainLayout>
      {/* useSearchParams bắt buộc bọc trong Suspense */}
      <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
        <BooksView />
      </Suspense>
      
    </MainLayout>
  );
}
