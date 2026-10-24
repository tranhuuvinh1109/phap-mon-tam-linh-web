import type { Metadata } from "next";
import React from "react";
import { AdminNotificationsView } from "./components/admin-notifications-view";

export const metadata: Metadata = {
  title: "Gửi & Thử nghiệm Thông báo Push | Quản trị Phật Pháp",
  description:
    "Công cụ quản trị gửi thông báo đẩy đến các thiết bị di động qua Expo Push Notification Service.",
};

export default function AdminNotificationsPage() {
  return (
    <main>
      <AdminNotificationsView />
    </main>
  );
}
