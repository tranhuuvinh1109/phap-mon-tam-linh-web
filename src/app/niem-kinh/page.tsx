import type { Metadata } from "next";
import React, { Suspense } from "react";

import { NiemKinhClient } from "./niem-kinh-client";

export const metadata: Metadata = {
  title: "Niệm Kinh | Thời khóa tụng niệm hàng ngày | Phật Pháp",
  description:
    "Hướng dẫn các bước Niệm kinh Phật giáo hàng ngày từng bước cho người mới bắt đầu.",
};

export default function NiemKinhPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <NiemKinhClient />
    </Suspense>
  );
}
