import type { Metadata } from "next";
import React, { Suspense } from "react";

import { SingleCategoryPostView } from "@/components/post";
import { THAP_HUONG_BAN_THO_PHAT_SLUG } from "@/constants";

export const metadata: Metadata = {
  title: "Thắp Hương Bàn Thờ Phật | Nghi thức trang nghiêm | Phật Pháp",
  description:
    "Hướng dẫn nghi thức thắp hương bàn thờ Phật trang nghiêm, thể hiện lòng thành kính thanh tịnh.",
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
      <SingleCategoryPostView
        categorySlug={THAP_HUONG_BAN_THO_PHAT_SLUG}
        categoryTitle="Thắp hương bàn thờ Phật"
      />
    </Suspense>
  );
}

