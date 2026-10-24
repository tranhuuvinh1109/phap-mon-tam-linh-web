import { Metadata } from "next";
import { KinhSachDetailClient } from "./kinh-sach-detail-client";

interface KinhSachPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: KinhSachPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug || "");

    return {
        title: `${decodedSlug} | Kinh Sách Phật Giáo`,
        description: `Đọc tài liệu kinh điển: ${decodedSlug}`,
    };
}

export default function KinhSachDetailPage() {
    return <KinhSachDetailClient />;
}
