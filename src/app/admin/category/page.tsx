import { Metadata } from "next";
import React from "react";

import { AdminCategoryView } from "./components/admin-category-view";

export const metadata: Metadata = {
  title: "Quản lý danh mục | Quản trị Phật Pháp",
  description: "Hệ thống quản lý cây chuyên mục nội dung và ấn phẩm Phật Pháp.",
};

export default function AdminCategoryPage() {
  return (
    <main className="space-y-6">
      <AdminCategoryView />
    </main>
  );
}

