import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { SignUpForm } from "./components/signup-form";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản | Pháp môn tâm linh",
  description: "Đăng ký tài khoản tham gia Pháp môn tâm linh - Nghe, Đọc, Tu Tập",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[#FDFBF7] lg:flex-row">
      {/* Left Visual Banner (Desktop / Tablet Large) */}
      <section className="relative hidden min-h-screen w-full flex-col justify-between overflow-hidden select-none lg:flex lg:w-1/2 xl:w-7/12">
        {/* Background Artwork */}
        <Image
          src="/images/auth-banner.jpg"
          alt="Phật Pháp - An lạc trong tâm, Từ bi trong đời"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-top transition-transform duration-1000 ease-out"
        />

        {/* Ambient Warm Golden Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-100/35 via-transparent to-amber-950/25" />

        {/* Top Header Logo on Artwork */}
        <div className="relative z-10 pt-10 text-center">
          <Link
            href="/"
            title="Về trang chủ"
            className="inline-block transition-opacity hover:opacity-85"
          >
            <LotusLogo size={52} showText showSubtitle textColor="text-amber-950" />
          </Link>
        </div>

        {/* Spiritual Poetic Calligraphy Section */}
        <div className="relative z-10 px-12 pb-24 xl:px-16">
          <blockquote
            className="space-y-1 text-3xl leading-relaxed font-bold text-[#503010] drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] xl:text-4xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <p>Gieo duyên lành</p>
            <p>vững bồ đề</p>
            <p className="pt-2">Nuôi dưỡng</p>
            <p>tâm từ bi</p>
          </blockquote>
        </div>

        {/* Subtle Bottom Ambient Gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </section>

      {/* Right Sign Up Form Container */}
      <section className="flex min-h-screen flex-1 items-center justify-center bg-[#FDFBF7] py-10">
        <Suspense fallback={<div className="h-96 w-full max-w-[420px] animate-pulse" />}>
          <SignUpForm />
        </Suspense>
      </section>
    </main>
  );
}
