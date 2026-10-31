import type { Metadata } from "next";
import React, { Suspense } from "react";
import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { KinhSachListClient } from "./kinh-sach-list-client";

const TITLE = "Kinh Sách Phật Giáo | Đọc sách lật trang 3D";
const DESCRIPTION =
  "Kho tàng kinh điển, sách Phật Pháp và tài liệu tu tập với trình đọc lật trang 3D chân thực.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
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
