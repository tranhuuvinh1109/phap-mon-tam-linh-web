"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef } from "react";

import { trackPageView } from "@/lib/gtm";

const PageTrackerContent: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Prevent duplicate pageview triggers on same URL
    if (prevUrlRef.current === currentUrl) return;

    const referrer = prevUrlRef.current || (typeof document !== "undefined" ? document.referrer : "");
    prevUrlRef.current = currentUrl;

    // Dispatch page_view event to dataLayer
    trackPageView({
      path: currentUrl,
      title: typeof document !== "undefined" ? document.title : "",
      location: typeof window !== "undefined" ? window.location.href : "",
      referrer,
    });
  }, [pathname, searchParams]);

  return null;
};

/**
 * Client component that tracks page views & client-side redirects in Next.js App Router.
 * Wrapped in Suspense to prevent de-opting static optimization when using useSearchParams.
 */
export const AnalyticsPageTracker: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <PageTrackerContent />
    </Suspense>
  );
};
