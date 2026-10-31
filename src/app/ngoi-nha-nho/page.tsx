import type { Metadata } from "next";
import React, { Suspense } from "react";

import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { NgoiNhaNhoClient } from "./ngoi-nha-nho-client";

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
      <NgoiNhaNhoClient />
    </Suspense>
  );
}
