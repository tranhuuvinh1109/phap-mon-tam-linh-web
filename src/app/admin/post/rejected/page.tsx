import { Metadata } from "next";
import React, { Suspense } from "react";

import { RejectedPostView } from "./rejected-post-view";

export const metadata: Metadata = {
  title: "Bài viết đã từ chối | Quản trị Phật Pháp",
  description: "Trang quản lý các bài viết đã bị từ chối phê duyệt.",
};

export default function AdminRejectedPostPage() {
  return (
    <main className="w-full max-w-full min-w-0">
      <Suspense
        fallback={
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent" />
          </div>
        }
      >
        <RejectedPostView />
      </Suspense>
    </main>
  );
}

