"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// `covers`: vài bìa sách thật xếp bên phải; `image`: một ảnh (giữ nguyên tỉ lệ); `big`: một con số lớn
const SLIDES: {
  title: string; desc: string; cta: string; href: string; bg: string;
  covers?: string[]; image?: string; big?: string;
}[] = [
  {
    title: "Nhà sách trực tuyến cho người thích đọc",
    desc: "Văn học, kinh tế, lịch sử, thiếu nhi. Đặt hàng online, thanh toán khi nhận hoặc trả trước.",
    cta: "Xem sách mới",
    href: "/#sach-moi",
    bg: "bg-primary",
    covers: ["/books/nha-gia-kim.jpg", "/books/atomic-habits.jpg", "/books/mat-biec.jpg"],
  },
  {
    title: "Giảm đến 30% cho nhóm sách chọn lọc",
    desc: "Nhập mã giảm giá ở bước đặt hàng, ưu đãi áp dụng ngay vào đơn của bạn.",
    cta: "Xem khuyến mãi",
    href: "/#khuyen-mai",
    bg: "bg-orange-800",
    image: "/banners/banner-2.jpg",
  },
  {
    title: "Đặt hàng dễ dàng, theo dõi từng bước",
    desc: "Thanh toán khi nhận hàng hoặc trực tuyến, xem trạng thái đơn ngay trên website.",
    cta: "Tìm hiểu thêm",
    href: "/#tai-sao",
    bg: "bg-sky-900",
    image: "/banners/banner-3.jpg",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <div
            key={s.title}
            className={`relative flex h-[320px] w-full shrink-0 items-center md:h-[440px] ${s.bg}`}
          >
            <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-8 px-6 md:px-16">
              <div className="max-w-xl text-white">
                <h2 className="text-3xl leading-tight font-bold md:text-5xl">{s.title}</h2>
                <p className="mt-4 text-base text-white/90 md:text-lg">{s.desc}</p>
                <Button asChild size="lg" className="mt-6 bg-white text-slate-900 hover:bg-white/90">
                  <Link href={s.href}>{s.cta}</Link>
                </Button>
              </div>

              {s.covers && (
                <div className="hidden h-[84%] items-end gap-4 md:flex">
                  {s.covers.map((c, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c}
                      src={c}
                      alt="Bìa sách"
                      className={`aspect-[2/3] w-auto rounded-lg object-cover shadow-2xl ring-2 ring-white/30 ${i === 1 ? "h-full" : "h-[88%]"}`}
                    />
                  ))}
                </div>
              )}

              {s.big && (
                <div className="hidden text-[9rem] leading-none font-extrabold text-white/95 md:block">{s.big}</div>
              )}

              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt={s.title}
                  className="hidden h-[82%] w-auto max-w-[50%] rounded-2xl object-contain shadow-2xl ring-4 ring-white/30 md:block"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        aria-label="Slide trước"
        onClick={() => go(index - 1)}
        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/25 p-2 text-white backdrop-blur hover:bg-white/40"
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Slide sau"
        onClick={() => go(index + 1)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/25 p-2 text-white backdrop-blur hover:bg-white/40"
      >
        <ChevronRight />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Chuyển đến slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
