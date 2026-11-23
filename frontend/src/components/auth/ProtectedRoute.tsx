"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (!useAuthStore.getState().accessToken) await refresh();

      // đọc lại state mới nhất sau khi refresh (tránh dùng giá trị cũ của closure)
      const { accessToken: token, user } = useAuthStore.getState();
      if (token && !user) await fetchMe();

      setStarting(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!starting && !loading && !accessToken) router.replace("/signin");
  }, [starting, loading, accessToken, router]);

  if (starting || loading || !accessToken) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-muted-foreground text-sm">Đang tải trang...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
