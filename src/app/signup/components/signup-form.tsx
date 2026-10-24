"use client";

import { AlertCircle, ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { useSignUp } from "@/api/auth/auth.hook";
import { LotusLogo } from "@/components/shared/lotus-logo";
import { Button } from "@/components/ui";
import { RegistrationSuccessTicket } from "./registration-success-ticket";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Success state holding the registered user data
  const [registeredUser, setRegisteredUser] = useState<{
    id?: string;
    email: string;
    name?: string;
    createdAt?: string;
  } | null>(null);

  const { mutate: handleSignUp, isPending } = useSignUp({
    onSuccess: (data) => {
      // Backend returns { message, user: { id, email, name, role, approvalStatus, ... } }
      const user = data?.user || {
        email: email.trim(),
        name: name.trim(),
      };
      setRegisteredUser(user);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.";
      setApiError(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const validate = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên.";
    }

    if (!email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Địa chỉ email không đúng định dạng.";
    }

    if (!password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    handleSignUp({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  // If successfully registered, show the Ticket Receipt UI
  if (registeredUser) {
    return <RegistrationSuccessTicket user={registeredUser} />;
  }

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
          Đăng ký tài khoản
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Cùng kết duyên lành, đồng hành tu tập và lan tỏa chánh pháp
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

      {/* Sign Up Form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-800">
            Họ và tên
          </label>
          <div className="mt-1.5">
            <input
              id="name"
              type="text"
              autoComplete="name"
              disabled={isPending}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${
                fieldErrors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-800">
            Email
          </label>
          <div className="mt-1.5">
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="Nhập email của bạn"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${
                fieldErrors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
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
              autoComplete="new-password"
              disabled={isPending}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Tối thiểu 6 ký tự"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${
                fieldErrors.password
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-800">
            Xác nhận mật khẩu
          </label>
          <div className="relative mt-1.5">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="Nhập lại mật khẩu"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 ${
                fieldErrors.confirmPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Notice Info */}
        <p className="pt-1 text-xs text-neutral-500">
          Sau khi đăng ký, tài khoản sẽ được gửi đến Ban Quản Trị để phê duyệt trước khi có thể đăng nhập.
        </p>

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
            <UserPlus className="mr-2 h-4 w-4" />
            Đăng ký tài khoản
          </Button>
        </div>
      </form>

      {/* Login Redirect Link */}
      <div className="mt-8 text-center text-sm text-neutral-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-800 transition-colors hover:text-amber-900 hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
