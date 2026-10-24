"use client";

import { CheckCircle2, Clock, Home, LogIn, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";

import { LotusLogo } from "@/components/shared/lotus-logo";

interface RegistrationSuccessTicketProps {
  user: {
    id?: string;
    email: string;
    name?: string;
    createdAt?: string;
  };
}

export function RegistrationSuccessTicket({ user }: RegistrationSuccessTicketProps) {
  // Generate a formatted registration ticket code
  const ticketCode = user.id
    ? `PMTL-${user.id.slice(0, 8).toUpperCase()}`
    : `PMTL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const formattedTime = new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-[480px] px-4 py-6 sm:px-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <LotusLogo size={48} />
        <h2
          className="mt-2 text-xl font-bold tracking-wide text-amber-900"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Pháp môn tâm linh
        </h2>
      </div>

      {/* Ticket Container */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-[#FAF7F0] shadow-xl shadow-amber-900/10">
        {/* Top Header of Ticket */}
        <div className="relative bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent px-6 pt-8 pb-6 text-center sm:px-8">
          {/* Glowing Success Badge */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-600/30">
            <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow">
              <Sparkles className="h-3 w-3" />
            </span>
          </div>

          <h1
            className="mt-4 text-2xl font-bold tracking-tight text-amber-950 sm:text-3xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Đăng Ký Thành Công
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600">
            Phiếu tiếp nhận hồ sơ thành viên mới
          </p>

          {/* Status Badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/90 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600"></span>
            </span>
            <Clock className="h-3.5 w-3.5" />
            <span>Đang chờ Ban Quản Trị phê duyệt</span>
          </div>
        </div>

        {/* Ticket Perforations / Cutouts & Dotted Line */}
        <div className="relative my-2 flex items-center justify-between">
          {/* Left Cutout */}
          <div className="-ml-3 h-6 w-6 rounded-full border-r border-amber-200/80 bg-[#FDFBF7]" />
          {/* Dashed line */}
          <div className="flex-1 border-t-2 border-dashed border-amber-200/90" />
          {/* Right Cutout */}
          <div className="-mr-3 h-6 w-6 rounded-full border-l border-amber-200/80 bg-[#FDFBF7]" />
        </div>

        {/* Ticket Body / Metadata Grid */}
        <div className="space-y-4 px-6 py-6 sm:px-8">
          <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-4 backdrop-blur-xs">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-medium text-neutral-400">Mã tiếp nhận</span>
                <p className="mt-0.5 font-mono text-xs font-bold text-amber-900 sm:text-sm">
                  {ticketCode}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-400">Thời gian tạo</span>
                <p className="mt-0.5 text-xs font-semibold text-neutral-800 sm:text-sm">
                  {formattedTime}
                </p>
              </div>

              {user.name && (
                <div className="col-span-2 border-t border-neutral-100 pt-2.5">
                  <span className="text-xs font-medium text-neutral-400">Họ và tên</span>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-800">
                    {user.name}
                  </p>
                </div>
              )}

              <div className="col-span-2 border-t border-neutral-100 pt-2.5">
                <span className="text-xs font-medium text-neutral-400">Email đăng ký</span>
                <p className="mt-0.5 break-all text-sm font-semibold text-neutral-800">
                  {user.email}
                </p>
              </div>

              <div className="col-span-2 border-t border-neutral-100 pt-2.5">
                <span className="text-xs font-medium text-neutral-400">Phân quyền ban đầu</span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-neutral-700">
                  <UserCheck className="h-3.5 w-3.5 text-amber-700" />
                  <span>Người dùng (USER)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compassionate Message Box */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
            <p className="font-semibold text-amber-950">A Di Đà Phật!</p>
            <p className="mt-1 text-amber-900/90">
              Yêu cầu đăng ký tài khoản của bạn đã được ghi nhận vào hệ thống.
              Ban Quản Trị sẽ xem xét và phê duyệt trong thời gian sớm nhất.
              Sau khi được duyệt, bạn sẽ có thể đăng nhập và tham gia các tính năng.
            </p>
          </div>

          {/* Buttons: Về trang chủ & Đăng nhập */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition-all hover:from-amber-700 hover:to-amber-900 hover:shadow-lg active:scale-[0.99]"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Link>

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white/70 py-3 text-sm font-semibold text-amber-950 transition-colors hover:bg-white hover:text-amber-900"
            >
              <LogIn className="h-4 w-4" />
              <span>Đến trang Đăng nhập</span>
            </Link>
          </div>
        </div>

        {/* Footer Accent Line */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-700" />
      </div>
    </div>
  );
}
