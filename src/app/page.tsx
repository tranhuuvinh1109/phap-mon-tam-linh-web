import type { Metadata } from "next";

import { HomeView } from "@/components/home";
import { DEFAULT_META_IMAGE, createOpenGraphMetadata } from "@/constants";

const TITLE = "Trang chủ | Phật Pháp - Nghe, Đọc, Tu Tập";
const DESCRIPTION =
  "Trang chủ ứng dụng Phật Pháp - Hướng dẫn tu tập, nghe kinh tụng, bài giảng và khai thị Phật pháp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function HomePage() {
  return <HomeView />;
}
