// Mỗi thẻ khuyến mãi hiện bìa sách thật (ảnh nằm ở /public/books)
const PROMOS = [
  {
    big: "-30%",
    title: "Sách kỹ năng sống",
    desc: "Giảm giá cho nhóm sách phát triển bản thân",
    bg: "bg-orange-700",
    covers: ["/books/atomic-habits.jpg", "/books/doi-ngan-dung-ngu-dai.jpg"],
  },
  {
    big: "-20%",
    title: "Văn học & tiểu thuyết",
    desc: "Ưu đãi cho tín đồ truyện hay",
    bg: "bg-rose-800",
    covers: ["/books/mat-biec.jpg", "/books/toi-thay-hoa-vang-tren-co-xanh.jpg"],
  },
  {
    big: "-15%",
    title: "Sách thiếu nhi",
    desc: "Quà tặng ý nghĩa cho bé yêu",
    bg: "bg-teal-800",
    covers: ["/books/hoang-tu-be.webp", "/books/de-men-phieu-luu-ky.webp"],
  },
];

export default function PromoBanners() {
  return (
    <section id="khuyen-mai" className="scroll-mt-20 pt-5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold md:text-2xl">Khuyến mãi hấp dẫn</h2>
          <p className="text-muted-foreground mt-1 text-sm">Nhập mã giảm giá ở bước đặt hàng để nhận ưu đãi.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PROMOS.map((p) => (
            <div
              key={p.title}
              className={`relative flex h-56 items-stretch justify-between gap-3 overflow-hidden rounded-2xl p-6 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg ${p.bg}`}
            >
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <span className="text-5xl font-extrabold">{p.big}</span>
                <div>
                  <h3 className="text-lg leading-snug font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm text-white/90">{p.desc}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-end -space-x-8 self-end">
                {p.covers.map((c) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={c}
                    src={c}
                    alt="Bìa sách"
                    className="aspect-[2/3] h-36 w-auto rounded-md object-cover shadow-xl ring-2 ring-white/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
