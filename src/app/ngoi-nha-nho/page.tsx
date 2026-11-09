import type { Metadata } from "next";
import React, { Suspense } from "react";

import { CategoryPostListView } from "@/components/post";
import { DEFAULT_META_IMAGE, NGOI_NHA_NHO_SLUG, createOpenGraphMetadata } from "@/constants";

const TITLE = "Ngôi Nhà Nhỏ | Học cách sống an lành | Phật Pháp";
const DESCRIPTION =
  "Tổng hợp bài viết hướng dẫn về Ngôi Nhà Nhỏ, phương pháp tu tập tiêu trừ nghiệp chướng, tích lũy công đức và tu dưỡng thân tâm.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
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
      <CategoryPostListView
        categorySlug={NGOI_NHA_NHO_SLUG}
        categoryTitle="Ngôi Nhà Nhỏ"
        categoryDescription="Tổng hợp các bài viết hướng dẫn chi tiết về Ngôi Nhà Nhỏ — phương pháp thù thắng giúp tiêu trừ nghiệp chướng, hóa giải oan kết và tích lũy công đức trên con đường tu tập an lành."
        heroBadgeLabel="Pháp Bảo Tu Tập"
        basePostUrl="/ngoi-nha-nho"
        searchPlaceholder="Tìm kiếm bài viết Ngôi Nhà Nhỏ..."
        activeNavId="ngoi-nha-nho"
      />
    </Suspense>
  );
}
