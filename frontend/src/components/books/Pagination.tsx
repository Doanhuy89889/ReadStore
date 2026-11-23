"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradientBtn } from "@/lib/ui";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function getPages(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

const base = "size-9 rounded-full";
const idle = "hover:border-primary/40 hover:bg-primary/10";

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      <Button variant="outline" size="icon" className={cn(base, idle)} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft />
      </Button>

      {getPages(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="text-muted-foreground px-1">…</span>
        ) : (
          <Button
            key={p}
            variant="outline"
            size="icon"
            className={cn(base, p === page ? gradientBtn : idle)}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button variant="outline" size="icon" className={cn(base, idle)} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <ChevronRight />
      </Button>
    </nav>
  );
}
