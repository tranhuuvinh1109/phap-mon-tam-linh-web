"use client";

import React, { useEffect } from "react";

import { AnalyticsPageTracker, GoogleTagManager } from "@/components/analytics";
import { trackButtonClick } from "@/lib/gtm";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Global delegated click listener for declarative button tracking (data-track-click)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trackEl = target.closest("[data-track-click]");
      if (!trackEl) return;

      const buttonName = trackEl.getAttribute("data-track-click");
      if (!buttonName) return;

      const category = trackEl.getAttribute("data-track-category") || "ui_interaction";
      const buttonId = trackEl.getAttribute("data-track-id") || trackEl.id || buttonName;

      trackButtonClick({
        buttonName,
        category,
        buttonId,
      });
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  return (
    <>
      <GoogleTagManager gtmId={gtmId} gaId={gaId} />
      <AnalyticsPageTracker />
      {children}
    </>
  );
};
