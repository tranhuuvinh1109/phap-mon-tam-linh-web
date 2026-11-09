"use client";

import React from "react";
import { CategoryPostListView } from "@/components/post";
import { NGOI_NHA_NHO_SLUG } from "@/constants";

export const NgoiNhaNhoClient: React.FC = () => {
  return (
    <CategoryPostListView
      categorySlug={NGOI_NHA_NHO_SLUG}
      categoryTitle="Ngôi Nhà Nhỏ"
      categoryDescription="Tổng hợp các bài viết hướng dẫn chi tiết về Ngôi Nhà Nhỏ — phương pháp thù thắng giúp tiêu trừ nghiệp chướng, hóa giải oan kết và tích lũy công đức trên con đường tu tập an lành."
      heroBadgeLabel="Pháp Bảo Tu Tập"
      basePostUrl="/ngoi-nha-nho"
      searchPlaceholder="Tìm kiếm bài viết Ngôi Nhà Nhỏ..."
      activeNavId="ngoi-nha-nho"
    />
  );
};
