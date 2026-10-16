import type { Metadata } from "next";
import React from "react";

import { AdminSettingsView } from "./components/admin-settings-view";

export const metadata: Metadata = {
  title: "Cài đặt & Bật tắt Chức năng | Quản trị Phật Pháp",
  description:
    "Trang quản lý cấu hình và bật/tắt các tính năng hệ thống của website Phật Pháp.",
};

export default function AdminSettingsPage() {
  return (
    <main>
      <AdminSettingsView />
    </main>
  );
}
