import { PostDetailClient } from "@/components/post";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || "");

  return {
    title: `${decodedSlug} | Niệm Kinh | Phật Pháp`,
    description: `Nội dung bài viết Niệm Kinh Phật Pháp: ${decodedSlug}`,
  };
}

export default function NiemKinhPostDetailPage() {
  return <PostDetailClient />;
}
