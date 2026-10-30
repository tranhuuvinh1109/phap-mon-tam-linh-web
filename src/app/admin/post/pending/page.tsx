import { Metadata } from "next";
import React, { Suspense } from "react";

import { PendingPostView } from "./pending-post-view";

export const metadata: Metadata = {
  title: "Bài viết chờ duyệt | Quản trị Phật Pháp",
  description: "Trang thẩm định và phê duyệt bài viết Phật Pháp.",
};

export default function AdminPendingPostPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent" />
          </div>
        }
      >
        <PendingPostView />
      </Suspense>
    </main>
  );
}
