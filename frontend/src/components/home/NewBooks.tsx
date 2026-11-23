"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bookService } from "@/services/bookService";
import type { Book } from "@/types/book";
import BookCard from "@/components/books/BookCard";

export default function NewBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    bookService
      .getNewBooks(8)
      .then(setBooks)
      .catch((e) => {
        console.error("Lỗi tải sách:", e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="sach-moi" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-5">
      <div className="bg-card rounded-2xl border p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Sách mới nhất</h2>
          <p className="text-muted-foreground mt-1 text-sm">Những đầu sách vừa lên kệ, đừng bỏ lỡ.</p>
        </div>
        <Link href="/books" className="text-primary shrink-0 text-sm font-medium hover:underline">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted aspect-[2/3] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-muted-foreground text-center text-sm">
          Không tải được danh sách sách. Hãy kiểm tra backend đã chạy chưa.
        </p>
      ) : books.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">Chưa có sách nào.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {books.map((b) => (
              <BookCard key={b._id} book={b} badge="Mới" />
            ))}
          </div>
        </>
      )}
      </div>
    </section>
  );
}
