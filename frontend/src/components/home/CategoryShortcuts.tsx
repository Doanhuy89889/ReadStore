"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Feather, Landmark, Smile, TrendingUp, type LucideIcon } from "lucide-react";
import { bookService } from "@/services/bookService";
import type { Category } from "@/types/book";

// chọn icon theo tên thể loại, thể loại lạ dùng icon quyển sách
const iconFor = (name: string): LucideIcon => {
  const n = name.toLowerCase();
  if (n.includes("kinh")) return TrendingUp;
  if (n.includes("văn")) return Feather;
  if (n.includes("thiếu")) return Smile;
  if (n.includes("lịch sử") || n.includes("khoa học")) return Landmark;
  return BookOpen;
};

export default function CategoryShortcuts() {
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    bookService.getCategories().then(setCats).catch(() => setCats([]));
  }, []);

  if (cats.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-5">
      <div className="bg-card flex gap-2 overflow-x-auto rounded-2xl border p-3 md:justify-around">
        {cats.map((c) => {
          const Icon = iconFor(c.name);
          return (
            <Link
              key={c._id}
              href={`/books?categories=${c._id}`}
              className="group flex min-w-24 shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-2 text-center transition hover:bg-primary/5"
            >
              <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
