import type { Metadata } from "next";
import React, { Suspense } from "react";

import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { KhaiThiClient } from "./khai-thi-client";

const TITLE = "Khai thị | Phật Pháp";
const DESCRIPTION =
  "Danh sách các bài viết Khai thị Phật pháp, lời vàng soi sáng tâm thức và mở lối tu tập.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function KhaiThiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <KhaiThiClient />
    </Suspense>
  );
}

