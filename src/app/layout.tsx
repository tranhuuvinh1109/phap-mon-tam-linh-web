import { type FC } from "react";

import { GoogleTagManagerNoScript } from "@/components/analytics";
import { PersistentAudioPlayer } from "@/components/audio";
import {
  AnalyticsProvider,
  AuthProvider,
  QueryProvider,
  ToastProvider,
} from "@/components/providers";
import { geistMono, geistSans } from "@/config";

import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import {
  DEFAULT_META_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  createOpenGraphMetadata,
} from "@/constants";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://quantheambotat-pmtl.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: `%s | ${DEFAULT_SITE_TITLE}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  ...createOpenGraphMetadata({
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type TProps = Readonly<IChildren>;
const RootLayout: FC<TProps> = ({ children }) => (
  <html lang="vi" suppressHydrationWarning>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <GoogleTagManagerNoScript gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      <QueryProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <ToastProvider />
            {children}
            <PersistentAudioPlayer />
          </AnalyticsProvider>
        </AuthProvider>
      </QueryProvider>
    </body>
  </html>
);

export default RootLayout;
