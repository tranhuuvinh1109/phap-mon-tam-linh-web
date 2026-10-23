import { sendGTMEvent as nextSendGTMEvent } from "@next/third-parties/google";
import type { DataLayerEvent } from "@/types/gtm";

/**
 * Push an event object to window.dataLayer for GTM and window.gtag for direct GA4
 */
export const sendGTMEvent = (
  event: string,
  params: Record<string, unknown> = {}
): void => {
  if (typeof window === "undefined") return;

  const eventPayload: DataLayerEvent = {
    event,
    ...params,
  };

  // Push to dataLayer using @next/third-parties/google
  nextSendGTMEvent(eventPayload);

  // If direct GA4 (gtag) is configured, forward standard event
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", event, params);
    } catch (err) {
      console.warn("[Analytics] gtag event error:", err);
    }
  }

  // Development logger for debugging without Tag Assistant
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics Event] "${event}"`, params);
  }
};

/**
 * Track page view / virtual page view for SPA client navigation
 */
export const trackPageView = ({
  path,
  title,
  location,
  referrer,
}: {
  path: string;
  title?: string;
  location?: string;
  referrer?: string;
}): void => {
  sendGTMEvent("page_view", {
    page_path: path,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
    page_location: location || (typeof window !== "undefined" ? window.location.href : ""),
    page_referrer: referrer || "",
  });
};

/**
 * Track user search interactions (Header, Category pages, Admin)
 */
export const trackSearch = ({
  searchTerm,
  searchLocation = "global",
  resultsCount,
}: {
  searchTerm: string;
  searchLocation?: string;
  resultsCount?: number;
}): void => {
  if (!searchTerm || !searchTerm.trim()) return;

  sendGTMEvent("search", {
    search_term: searchTerm.trim(),
    search_location: searchLocation,
    ...(typeof resultsCount === "number" ? { results_count: resultsCount } : {}),
  });
};

/**
 * Track button click events (Declarative or Programmatic)
 */
export const trackButtonClick = ({
  buttonName,
  category = "button",
  buttonId,
  ...extra
}: {
  buttonName: string;
  category?: string;
  buttonId?: string;
  [key: string]: unknown;
}): void => {
  sendGTMEvent("button_click", {
    button_name: buttonName,
    button_category: category,
    button_id: buttonId || buttonName,
    ...extra,
  });
};

/**
 * Track programmatic / intentional redirects (Auth guards, Feature flags)
 */
export const trackRedirect = ({
  from,
  to,
  reason,
}: {
  from: string;
  to: string;
  reason?: string;
}): void => {
  sendGTMEvent("redirect", {
    redirect_from: from,
    redirect_to: to,
    redirect_reason: reason || "unknown",
  });
};

/**
 * Track user audio interaction clicks (Play, Pause, Close mini player)
 */
export const trackAudioClick = ({
  action,
  trackTitle,
  trackId,
}: {
  action: "play" | "pause" | "close";
  trackTitle?: string;
  trackId?: string;
}): void => {
  sendGTMEvent("audio_click", {
    audio_action: action,
    track_title: trackTitle || "",
    track_id: trackId || "",
  });
};

/**
 * Track bookmark / favorite button clicks
 */
export const trackBookmarkClick = ({
  action,
  itemTitle,
  itemId,
  category,
}: {
  action: "add" | "remove";
  itemTitle: string;
  itemId: string;
  category?: string;
}): void => {
  sendGTMEvent("bookmark_click", {
    bookmark_action: action,
    item_title: itemTitle,
    item_id: itemId,
    category: category || "general",
  });
};
