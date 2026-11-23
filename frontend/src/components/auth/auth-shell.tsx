import { forwardRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { gradientBg } from "@/lib/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShellProps extends Omit<ComponentProps<"div">, "title"> {
  title: string;
  subtitle: string;
  image: string;
  children: ReactNode;
}

/** Khung chung cho trang đăng nhập / đăng ký */
export function AuthShell({ title, subtitle, image, className, children, ...props }: ShellProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-xl shadow-primary/10">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-10">
            <div className="mb-7 flex flex-col items-center gap-2 text-center">
              <Link href="/">
                <img src="/logo.svg" alt="logo" />
              </Link>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground text-balance text-sm">{subtitle}</p>
            </div>
            {children}
          </div>

          <div className={cn("relative hidden md:block", gradientBg)}>
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-overlay"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground px-6 text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </p>
    </div>
  );
}

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

/** Label + Input + thông báo lỗi (tương thích register của react-hook-form) */
export const AuthField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, className, ...props }, ref) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        className={cn("bg-muted/40 h-11 rounded-xl focus-visible:ring-primary/30", className)}
        {...props}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
);
AuthField.displayName = "AuthField";
