import { PostDetailClient } from "@/components/post";
import { Metadata } from "next";
import React from "react";
import { getPostBySlug } from "@/api/post";
import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { stripHtml } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || "");

  try {
    const post = await getPostBySlug(decodedSlug);
    const postTitle = post?.title
      ? `${post.title} | Bạch Thoại Phật Pháp`
      : `${decodedSlug} | Bạch Thoại Phật Pháp`;
    const postDesc = post?.content
      ? stripHtml(post.content).slice(0, 160)
      : `Nội dung bài viết Bạch Thoại Phật Pháp: ${decodedSlug}`;
    const metaImage = post?.thumbnailUrl || DEFAULT_META_IMAGE;

    return {
      title: postTitle,
      description: postDesc,
      ...createOpenGraphMetadata({
        title: postTitle,
        description: postDesc,
        imageUrl: metaImage,
      }),
    };
  } catch {
    const fallbackTitle = `${decodedSlug} | Bạch Thoại Phật Pháp`;
    const fallbackDesc = `Nội dung bài viết Phật Pháp: ${decodedSlug}`;

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      ...createOpenGraphMetadata({
        title: fallbackTitle,
        description: fallbackDesc,
        imageUrl: DEFAULT_META_IMAGE,
      }),
    };
  }
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
