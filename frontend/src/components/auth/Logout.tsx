"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const Logout = () => {
  const { signOut } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="rounded-full hover:border-primary/40 hover:bg-primary/10"
    >
      <LogOut /> Đăng xuất
    </Button>
  );
};

export default Logout;
