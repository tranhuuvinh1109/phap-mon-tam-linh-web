import type { Metadata } from "next";
import React, { Suspense } from "react";

import { NgoiNhaNhoClient } from "./ngoi-nha-nho-client";

export const metadata: Metadata = {
  title: "Ngôi Nhà Nhỏ | Học cách sống an lành | Phật Pháp",
  description:
    "Tổng hợp bài viết hướng dẫn về Ngôi Nhà Nhỏ, phương pháp tu tập tiêu trừ nghiệp chướng, tích lũy công đức và tu dưỡng thân tâm.",
};

export default function NgoiNhaNhoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <NgoiNhaNhoClient />
    </Suspense>
  );
}
