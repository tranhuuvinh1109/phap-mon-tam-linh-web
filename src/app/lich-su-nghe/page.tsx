import type { Metadata } from "next";

import { LichSuNgheClient } from "./lich-su-nghe-client";

export const metadata: Metadata = {
  title: "Lịch sử nghe Bạch thoại Phật pháp | Phật Pháp Web",
  description:
    "Danh sách các bài giảng Bạch thoại Phật pháp bạn đã nghe, theo dõi tiến độ và tiếp tục lắng nghe những pháp âm vi diệu.",
};

export default function LichSuNghePage() {
  return <LichSuNgheClient />;
}
