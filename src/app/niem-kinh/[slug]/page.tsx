import { PostDetailClient } from "@/components/post";
import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || "");
  const title = `${decodedSlug} | Niệm Kinh | Phật Pháp`;
  const description = `Nội dung bài viết Niệm Kinh Phật Pháp: ${decodedSlug}`;

  return {
    title,
    description,
    ...createOpenGraphMetadata({
      title,
      description,
      imageUrl: DEFAULT_META_IMAGE,
    }),
  };
}

export default function NiemKinhPostDetailPage() {
  return <PostDetailClient />;
}
