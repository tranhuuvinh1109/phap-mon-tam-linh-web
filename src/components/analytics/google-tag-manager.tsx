import {
  GoogleAnalytics as NextGoogleAnalytics,
  GoogleTagManager as NextGoogleTagManager,
} from "@next/third-parties/google";
import React from "react";

interface GoogleTagManagerProps {
  gtmId?: string;
  gaId?: string;
}

/**
 * Script loader using official @next/third-parties/google.
 */
export const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({
  gtmId,
  gaId,
}) => {
  return (
    <>
      {gtmId && <NextGoogleTagManager gtmId={gtmId} />}
      {gaId && <NextGoogleAnalytics gaId={gaId} />}
    </>
  );
};

/**
 * NoScript fallback for Google Tag Manager (placed right after <body>)
 */
export const GoogleTagManagerNoScript: React.FC<{ gtmId?: string }> = ({
  gtmId,
}) => {
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};
