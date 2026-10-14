import { Metadata } from "next";
import React, { Suspense } from "react";

import { AdminPostView } from "./components/admin-post-view";

export const metadata: Metadata = {
  title: "Quản lý Bài viết | Quản trị Phật Pháp",
  description: "Trang quản lý danh sách bài viết Phật Pháp.",
};

export default function AdminPostPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent" />
          </div>
        }
      >
        <AdminPostView />
      </Suspense>
    </main>
  );
}

