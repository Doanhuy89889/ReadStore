import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import FooterAuthLink from "./FooterAuthLink";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <BookOpen className="size-6" /> ReadStore
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Nhà sách trực tuyến dành cho người yêu sách: nhiều đầu sách, giá hợp lý, đặt hàng nhanh chóng và
            theo dõi đơn dễ dàng.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">Khám phá</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#sach-moi" className="hover:text-white">Sách mới</Link></li>
            <li><Link href="/#khuyen-mai" className="hover:text-white">Khuyến mãi</Link></li>
            <li><Link href="/#tai-sao" className="hover:text-white">Vì sao chọn chúng tôi</Link></li>
            <li><Link href="/contact" className="hover:text-white">Liên hệ</Link></li>
            <FooterAuthLink />
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">Liên hệ</h3>
          {/* TODO: thay bằng thông tin thật của cửa hàng */}
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> 123 Đường ABC, TP.HCM</li>
            <li className="flex items-center gap-2"><Phone className="size-4 shrink-0" /> 0900 000 000</li>
            <li className="flex items-center gap-2"><Mail className="size-4 shrink-0" /> hotro@readstore.vn</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ReadStore. Đã đăng ký bản quyền.
      </div>
    </footer>
  );
}