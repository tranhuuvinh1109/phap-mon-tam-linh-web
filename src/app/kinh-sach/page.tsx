import type { Metadata } from "next";
import React, { Suspense } from "react";
import { KinhSachListClient } from "./kinh-sach-list-client";

export const metadata: Metadata = {
  title: "Kinh Sách Phật Giáo | Đọc sách lật trang 3D",
  description:
    "Kho tàng kinh điển, sách Phật Pháp và tài liệu tu tập với trình đọc lật trang 3D chân thực.",
};

export default function KinhSachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <KinhSachListClient />
    </Suspense>
  );
}
