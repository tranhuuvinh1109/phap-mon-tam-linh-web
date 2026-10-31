import { Metadata } from "next";
import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";
import { KinhSachDetailClient } from "./kinh-sach-detail-client";

interface KinhSachPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: KinhSachPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || "");
  const title = `${decodedSlug} | Kinh Sách Phật Giáo`;
  const description = `Đọc tài liệu kinh điển: ${decodedSlug}`;

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

export default function KinhSachDetailPage() {
    return <KinhSachDetailClient />;
}
