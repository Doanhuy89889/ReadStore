"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CreditCard, LogOut, Menu, PackageSearch, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";
import { useCartStore } from "@/stores/useCartStore";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Sách", href: "/books" },
  { label: "Sách mới", href: "/#sach-moi" },
  { label: "Khuyến mãi", href: "/#khuyen-mai" },
  { label: "Vì sao chọn chúng tôi", href: "/#tai-sao" },
  { label: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const { user, accessToken, setAccessToken, fetchMe, signOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { count, fetchCart, reset: resetCart } = useCartStore();
  const router = useRouter();

  // khôi phục phiên đăng nhập (im lặng, không báo lỗi nếu khách chưa đăng nhập)
  useEffect(() => {
    if (accessToken) return;
    (async () => {
      try {
        const token = await authService.refresh();
        setAccessToken(token);
        await fetchMe();
      } catch {
        /* khách vãng lai */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // đăng nhập -> tải giỏ hàng từ session; đăng xuất -> xoá giỏ trên giao diện
  useEffect(() => {
    if (user?._id) fetchCart();
    else resetCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (q) router.push(`/books?q=${encodeURIComponent(q)}`);
  };

  const isLoggedIn = !!accessToken && !!user;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold text-primary">
          <BookOpen className="size-6" />
          ReadStore
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm font-medium whitespace-nowrap xl:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-foreground/80 transition hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-[14rem] min-w-[9rem] flex-1 md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả..."
            className="pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 whitespace-nowrap md:ml-0">
          <Button asChild variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
            <Link href="/cart">
              <ShoppingCart />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {isLoggedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/orders">
                  <PackageSearch /> Đơn hàng
                </Link>
              </Button>
              {count > 0 && (
                <Button asChild size="sm">
                  <Link href="/checkout">
                    <CreditCard /> Thanh toán
                  </Link>
                </Button>
              )}
              <span className="flex items-center gap-1 text-sm font-medium whitespace-nowrap" title={user?.displayName}>
                <User className="size-4" />
                <span className="hidden max-w-24 truncate 2xl:inline">{user?.displayName}</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut /> Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Đăng ký</Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* menu mobile */}
      {open && (
        <div className="border-t px-4 py-3 xl:hidden">
          <form onSubmit={handleSearch} className="relative mb-3 md:hidden">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên sách, tác giả..."
              className="pl-9"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
                >
                  Đơn hàng của tôi
                </Link>
                {count > 0 && (
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-primary px-2 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Thanh toán ({count} sách)
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="mt-3 flex gap-2 sm:hidden">
            {isLoggedIn ? (
              <Button variant="outline" className="w-full" onClick={() => signOut()}>
                <LogOut /> Đăng xuất ({user?.displayName})
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/signin">Đăng nhập</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/signup">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}