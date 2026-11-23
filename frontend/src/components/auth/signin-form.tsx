"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { gradientBtn, gradientText } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthField, AuthShell } from "./auth-shell";

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async ({ username, password }: SignInFormValues) => {
    await signIn(username, password);
    router.push("/");
  };

  return (
    <AuthShell
      title="Chào mừng quay lại"
      subtitle="Đăng nhập vào tài khoản ReadStore của bạn"
      image="/placeholder.png"
      className={className}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <AuthField
          id="username"
          label="Tên đăng nhập"
          placeholder="ReadStore"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthField
          id="password"
          type="password"
          label="Mật khẩu"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" size="lg" className={cn("h-11 w-full rounded-xl", gradientBtn)} disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className={cn("font-semibold", gradientText)}>
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
