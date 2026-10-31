import type { Metadata } from "next";

export const DEFAULT_META_IMAGE = "/images/home-hero-banner.jpg";

export const DEFAULT_SITE_TITLE = "Pháp Môn Tâm Linh";
export const DEFAULT_SITE_DESCRIPTION =
  "Ứng dụng Pháp Môn Tâm Linh - Tu tập, niệm kinh, bạch thoại phật pháp";

export interface OpenGraphOptions {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
}

export function createOpenGraphMetadata({
  title,
  description,
  imageUrl = DEFAULT_META_IMAGE,
  url,
}: OpenGraphOptions): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];

  return {
    openGraph: {
      title,
      description,
      url,
      images,
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
