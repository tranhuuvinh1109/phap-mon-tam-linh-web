import { Metadata } from "next";
import React, { Suspense } from "react";

import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";

import { ChapterDetailClient } from "./chapter-detail-client";

interface ChapterPageProps {
  params: Promise<{ chapter: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const chapterNumber = parseInt(resolvedParams.chapter || "1", 10);
  const title = `Bạch Thoại Phật Pháp - Quyển ${chapterNumber} | Phật Pháp`;
  const description = `Danh sách các bài giảng, audio thuộc Quyển ${chapterNumber} trong tuyển tập Bạch Thoại Phật Pháp.`;

  return {
    title,
    description,
    ...createOpenGraphMetadata({
      title,
      description,
      imageUrl: "/images/bach-thoai-phat-phap-bg-quyen-widget.png",
    }),
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const resolvedParams = await params;
  const chapterNumber = parseInt(resolvedParams.chapter || "1", 10);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      }
    >
      <ChapterDetailClient chapterNumber={isNaN(chapterNumber) ? 1 : chapterNumber} />
    </Suspense>
  );
}
