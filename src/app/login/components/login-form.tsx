"use client";

import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { useSignIn } from "@/api/auth/auth.hook";
import { LotusLogo } from "@/components/shared/lotus-logo";
import { Button } from "@/components/ui";
import { RoleEnum } from "@/enums";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preUrl = searchParams.get("pre-url") || searchParams.get("preUrl") || "/";
  const setAuth = useAuthStore((state) => state.setAuth);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate: handleSignIn, isPending } = useSignIn({
    onSuccess: (data) => {
      setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      const userRole = data.user?.role;
      const isAdminOrCollab =
        userRole === RoleEnum.ADMIN || userRole === RoleEnum.COLLABORATOR;

      if (isAdminOrCollab) {
        toast.success("Đăng nhập thành công!");
        router.push("/admin");
      } else {
        toast.error("Tài khoản không có quyền truy cập trang quản trị", {
          id: "no-admin-access",
        });
        router.push("/");
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập không thành công. Vui lòng thử lại.";
      setApiError(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const validate = () => {
    const errors: { emailOrPhone?: string; password?: string } = {};

    if (!emailOrPhone.trim()) {
      errors.emailOrPhone = "Vui lòng nhập email hoặc số điện thoại.";
    }

    if (!password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    handleSignIn({
      email: emailOrPhone.trim(),
      password,
    });
  };

  return (
    <div className="w-full max-w-[420px] px-4 py-8 sm:px-6">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE5D8] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 shadow-2xs backdrop-blur-xs transition hover:border-amber-600 hover:bg-amber-50/60 hover:text-amber-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {/* Top Lotus Logo & Brand Heading (Clickable to Home) */}
      <div className="text-center">
        <Link
          href="/"
          title="Về trang chủ"
          className="group inline-flex flex-col items-center transition-transform hover:scale-105"
        >
          <LotusLogo size={56} />
          <h2
            className="mt-3 text-2xl font-bold tracking-wide text-amber-900 group-hover:text-amber-950"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Pháp môn tâm linh
          </h2>
        </Link>
      </div>

      {/* Screen Title & Tagline */}
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Đăng nhập
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Cùng lan tỏa những giá trị tốt đẹp của Pháp môn tâm linh
        </p>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="animate-fade-in mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {/* Email or Phone Field */}
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-semibold text-neutral-800">
            Email
          </label>
          <div className="mt-1.5">
            <input
              id="emailOrPhone"
              type="text"
              autoComplete="username"
              disabled={isPending}
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                if (fieldErrors.emailOrPhone) {
                  setFieldErrors((prev) => ({ ...prev, emailOrPhone: undefined }));
                }
              }}
              placeholder="Nhập email hoặc số điện thoại"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${fieldErrors.emailOrPhone
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                }`}
            />
          </div>
          {fieldErrors.emailOrPhone && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.emailOrPhone}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-neutral-800">
            Mật khẩu
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Nhập mật khẩu"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${fieldErrors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                }`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-amber-700 accent-amber-700 focus:ring-amber-500"
            />
            <span className="text-xs font-medium text-neutral-700 sm:text-sm">
              Ghi nhớ đăng nhập
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-medium text-amber-800 transition-colors hover:text-amber-900 hover:underline sm:text-sm"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="golden"
            size="lg"
            fullWidth
            isLoading={isPending}
            disabled={isPending}
            className="rounded-xl py-3 text-base font-semibold shadow-md shadow-amber-800/15 transition-all hover:shadow-lg hover:shadow-amber-800/25 active:scale-[0.99]"
          >
            Đăng nhập
          </Button>
        </div>
      </form>
    </div>
  );
}
