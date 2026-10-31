import type { Metadata } from "next";
import React, { Suspense } from "react";

import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { BachThoaiClient } from "./bach-thoai-client";

const TITLE = "Bạch thoại Phật pháp | Phật Pháp";
const DESCRIPTION =
  "Danh sách các bài giảng, pháp thoại và bài viết Bạch thoại Phật pháp dành cho người mới bắt đầu.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function BachThoaiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <BachThoaiClient />
    </Suspense>
  );
}

