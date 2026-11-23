import MainLayout from "@/components/layout/MainLayout";
import BookDetailView from "@/components/books/BookDetailView";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <MainLayout>
      <BookDetailView id={id} />
    </MainLayout>
  );
}