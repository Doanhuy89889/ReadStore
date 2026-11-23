"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

// Link "Đăng nhập" ở footer: chỉ hiện khi khách chưa đăng nhập
export default function FooterAuthLink() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  if (accessToken && user) return null;
  return (
    <li>
      <Link href="/signin" className="hover:text-white">Đăng nhập</Link>
    </li>
  );
}
