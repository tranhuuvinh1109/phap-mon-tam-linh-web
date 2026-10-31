import type { Metadata } from "next";
import React, { Suspense } from "react";

import { SingleCategoryPostView } from "@/components/post";
import {
  DEFAULT_META_IMAGE,
  PHAT_NGUYEN_SLUG,
  createOpenGraphMetadata,
} from "@/constants";

export const metadata: Metadata = {
  title: "Phát Nguyện | Nghi thức phát nguyện từ tâm | Phật Pháp",
  description:
    "Hướng dẫn phát nguyện từ tâm trên bước đường tu học Phật Pháp và thực hành tâm linh.",
  ...createOpenGraphMetadata({
    title: "Phát Nguyện | Nghi thức phát nguyện từ tâm | Phật Pháp",
    description:
      "Hướng dẫn phát nguyện từ tâm trên bước đường tu học Phật Pháp và thực hành tâm linh.",
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function PhatNguyenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <SingleCategoryPostView
        categorySlug={PHAT_NGUYEN_SLUG}
        categoryTitle="Phát Nguyện"
      />
    </Suspense>
  );
}

