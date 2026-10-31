import type { Metadata } from "next";
import React, { Suspense } from "react";

import { SingleCategoryPostView } from "@/components/post";
import { PHONG_SINH_SLUG } from "@/constants";

export const metadata: Metadata = {
  title: "Phóng Sanh | Nghi thức và ý nghĩa phóng sinh | Phật Pháp",
  description:
    "Hướng dẫn nghi thức và ý nghĩa phóng sanh từ bi, cứu giúp muôn loài và gieo duyên lành.",
};

export default function PhongSinhPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <SingleCategoryPostView
        categorySlug={PHONG_SINH_SLUG}
        categoryTitle="Phóng sinh"
      />
    </Suspense>
  );
}

