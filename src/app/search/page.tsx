import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Tìm kiếm bài viết | Pháp môn tâm linh",
  description: "Tìm kiếm các bài khai thị, bạch thoại phật pháp, kinh tụng và cẩm nang tu học trên hệ thống Pháp môn tâm linh",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-700 border-t-transparent" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
