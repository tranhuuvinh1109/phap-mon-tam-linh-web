"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGetSettingById } from "@/api/setting";
import { FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID } from "@/constants";
import { trackRedirect } from "@/lib/gtm";

export default function BachThoaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: setting, isLoading } = useGetSettingById(
    FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID
  );

  const isEnabled = setting ? setting.isEnabled : true;

  useEffect(() => {
    // If setting is loaded and disabled, redirect to home page
    if (!isLoading && setting && setting.isEnabled === false) {
      trackRedirect({
        from: "/bach-thoai-phat-phap",
        to: "/",
        reason: "feature_flag_disabled",
      });
      router.replace("/");
    }
  }, [isLoading, setting, router]);

  // Prevent flashing disabled content before redirecting
  if (!isLoading && setting && setting.isEnabled === false) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent" />
          <p className="text-sm font-medium text-neutral-600">
            Đang chuyển hướng về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
