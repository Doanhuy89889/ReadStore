"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { bookService } from "@/services/bookService";
import type { BookListResponse, Category } from "@/types/book";
import { cn } from "@/lib/utils";
import { gradientBtn } from "@/lib/ui";
import BookCard from "./BookCard";
import FilterSidebar from "./FilterSidebar";
import Pagination from "./Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 12;

export default function BooksView() {
  const router = useRouter();
  const sp = useSearchParams();

  // toàn bộ bộ lọc được lưu trên URL -> F5 / chia sẻ link vẫn giữ nguyên kết quả
  const q = sp.get("q") ?? "";
  const categories = sp.get("categories")?.split(",").filter(Boolean) ?? [];
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";
  const sort = sp.get("sort") ?? "new";
  const page = Math.max(Number(sp.get("page")) || 1, 1);

  const [keyword, setKeyword] = useState(q);
  const [showFilter, setShowFilter] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [data, setData] = useState<BookListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const setParams = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/books?${qs}` : "/books");
  };

  // tải danh sách thể loại 1 lần
  useEffect(() => {
    bookService.getCategories().then(setAllCategories).catch(() => {});
  }, []);

  // đồng bộ ô tìm kiếm với URL
  useEffect(() => {
    setKeyword(q);
  }, [q]);

  // tải sách mỗi khi bộ lọc / trang thay đổi
  const queryString = sp.toString();
  useEffect(() => {
    setLoading(true);
    setError(false);
    bookService
      .getBooks({ q, categories: categories.join(","), minPrice, maxPrice, sort, page, limit: PAGE_SIZE })
      .then(setData)
      .catch((e) => {
        console.error("Lỗi tải sách:", e);
        setError(true);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: keyword.trim() });
  };

  const toggleCategory = (id: string) => {
    const next = categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id];
    setParams({ categories: next.join(",") });
  };

  const changePage = (p: number) => {
    setParams({ page: p > 1 ? String(p) : null }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* đường dẫn + tìm kiếm */}
      <nav className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Tất cả sách</span>
      </nav>
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">Tất cả sách</h1>

      <form onSubmit={handleSearch} className="bg-card flex items-center gap-1 rounded-2xl border p-1.5">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả, nhà xuất bản..."
            className="text-foreground h-10 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button type="button" variant="ghost" className="text-foreground lg:hidden" onClick={() => setShowFilter(!showFilter)}>
          <SlidersHorizontal /> Lọc
        </Button>
        <Button type="submit" className={cn("rounded-xl px-6", gradientBtn)}>
          Tìm kiếm
        </Button>
      </form>

      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className={cn("self-start lg:sticky lg:top-6", showFilter ? "block" : "hidden lg:block")}>
          <FilterSidebar
            categories={allCategories}
            selectedCategories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onToggleCategory={toggleCategory}
            onPriceChange={(min, max) => setParams({ minPrice: min, maxPrice: max })}
            onClear={() => setParams({ categories: null, minPrice: null, maxPrice: null })}
          />
        </div>

        <div className="bg-card rounded-2xl border p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <p className="text-muted-foreground text-sm">
              {data ? (
                <>
                  Tìm thấy <b className="text-foreground">{data.total}</b> sách
                  {q && (
                    <>
                      {" "}cho từ khoá “<b className="text-foreground">{q}</b>”
                    </>
                  )}
                </>
              ) : (
                "Đang tải..."
              )}
            </p>

            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value === "new" ? null : e.target.value })}
              className="bg-background h-9 rounded-full border px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Sắp xếp"
            >
              <option value="new">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name">Tên A - Z</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted aspect-[2/3] animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Không tải được danh sách sách. Hãy kiểm tra backend đã chạy chưa.
            </p>
          ) : !data || data.books.length === 0 ? (
            <div className="bg-muted/30 rounded-3xl border border-dashed py-14 text-center">
              <p className="text-muted-foreground text-sm">Không tìm thấy sách phù hợp.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full hover:border-primary/40 hover:bg-primary/10"
                onClick={() => {
                  setKeyword("");
                  router.push("/books");
                }}
              >
                Xoá tìm kiếm và bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {data.books.map((b) => (
                  <BookCard key={b._id} book={b} />
                ))}
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
