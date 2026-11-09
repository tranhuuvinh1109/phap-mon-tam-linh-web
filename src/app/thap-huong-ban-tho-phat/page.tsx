import type { Metadata } from "next";
import React, { Suspense } from "react";

import { CategoryPostListView } from "@/components/post";
import {
  DEFAULT_META_IMAGE,
  THAP_HUONG_BAN_THO_PHAT_ID,
  THAP_HUONG_BAN_THO_PHAT_SLUG,
  createOpenGraphMetadata,
} from "@/constants";

export const metadata: Metadata = {
  title: "Thắp Hương Bàn Thờ Phật | Nghi thức trang nghiêm | Phật Pháp",
  description:
    "Hướng dẫn nghi thức thắp hương bàn thờ Phật trang nghiêm, thể hiện lòng thành kính thanh tịnh.",
  ...createOpenGraphMetadata({
    title: "Thắp Hương Bàn Thờ Phật | Nghi thức trang nghiêm | Phật Pháp",
    description:
      "Hướng dẫn nghi thức thắp hương bàn thờ Phật trang nghiêm, thể hiện lòng thành kính thanh tịnh.",
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function ThapHuongBanThoPhatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <CategoryPostListView
        categoryId={THAP_HUONG_BAN_THO_PHAT_ID}
        categorySlug={THAP_HUONG_BAN_THO_PHAT_SLUG}
        categoryTitle="Thắp hương bàn thờ Phật"
        categoryDescription="Tổng hợp các bài viết và nghi thức hướng dẫn chi tiết về thắp hương bàn thờ Phật — thể hiện lòng thành kính thanh tịnh, đúng như lý như pháp."
        heroBadgeLabel="Nghi Thức Trang Nghiêm"
        basePostUrl="/thap-huong-ban-tho-phat"
        searchPlaceholder="Tìm kiếm bài viết Thắp hương bàn thờ Phật..."
        activeNavId="practice"
      />
    </Suspense>
  );
}

