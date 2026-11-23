"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { chipActive, chipIdle, gradientBtn } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/book";

const PRICE_RANGES = [
  { label: "Tất cả", min: "", max: "" },
  { label: "Dưới 50.000₫", min: "", max: "50000" },
  { label: "50.000₫ - 100.000₫", min: "50000", max: "100000" },
  { label: "100.000₫ - 150.000₫", min: "100000", max: "150000" },
  { label: "Trên 150.000₫", min: "150000", max: "" },
];

interface Props {
  categories: Category[];
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  onToggleCategory: (id: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onClear: () => void;
}

const chip = "rounded-full border px-3 py-1 text-xs font-medium transition";

export default function FilterSidebar({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  onToggleCategory,
  onPriceChange,
  onClear,
}: Props) {
  const [customMin, setCustomMin] = useState(minPrice);
  const [customMax, setCustomMax] = useState(maxPrice);

  // đồng bộ ô nhập khi URL thay đổi (vd bấm "Xoá bộ lọc")
  useEffect(() => {
    setCustomMin(minPrice);
    setCustomMax(maxPrice);
  }, [minPrice, maxPrice]);

  const hasFilter = selectedCategories.length > 0 || minPrice !== "" || maxPrice !== "";

  return (
    <aside className="bg-card space-y-6 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Bộ lọc</h2>
        {hasFilter && (
          <button onClick={onClear} className="text-sm font-medium text-primary hover:underline">
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Thể loại */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Thể loại</h3>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có thể loại.</p>
        ) : (
          <ul className="space-y-0.5">
            {categories.map((c) => {
              const active = selectedCategories.includes(c._id);
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggleCategory(c._id)}
                    className={cn(
                      "hover:bg-primary/10 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition",
                      active && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-muted-foreground text-xs">{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Khoảng giá */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Khoảng giá</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => {
            const active = minPrice === r.min && maxPrice === r.max;
            return (
              <button
                key={r.label}
                type="button"
                aria-pressed={active}
                onClick={() => onPriceChange(r.min, r.max)}
                className={cn(chip, active ? chipActive : chipIdle)}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Từ"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="h-9 rounded-full px-3"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={0}
            placeholder="Đến"
            value={customMax}
            onChange={(e) => setCustomMax(e.target.value)}
            className="h-9 rounded-full px-3"
          />
        </div>
        <Button
          className={cn("mt-3 w-full rounded-full", gradientBtn)}
          size="sm"
          onClick={() => onPriceChange(customMin, customMax)}
        >
          Áp dụng
        </Button>
      </div>
    </aside>
  );
}
