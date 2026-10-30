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

export const metadata: Metadata = {
  title: "Phap Mon Tam Linh",
  description: "Phap Mon Tam Linh application",
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
