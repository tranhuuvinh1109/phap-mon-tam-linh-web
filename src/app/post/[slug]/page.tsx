import { PostDetailClient } from "@/components/post";
import { Metadata } from "next";
import React from "react";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || "");

  return {
    title: `${decodedSlug} | Phật Pháp`,
    description: `Nội dung bài viết Phật Pháp: ${decodedSlug}`,
  };
}

export default function UniversalPostDetailPage() {
  return <PostDetailClient />;
}
