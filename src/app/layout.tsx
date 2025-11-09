import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { TrackingScript } from "@/components/tracking-script";
import { Toaster } from "@/components/toaster";
import { ServiceWorkerRegister } from "@/components/pwa-register";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokushima.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "徳島観光PWA | Local Discovery",
    template: "%s | 徳島観光PWA"
  },
  description:
    "徳島に特化した観光・モデルコース・AIコンシェルジュを提供するPWA。microCMS連携で最新のスポットや記事を配信。",
  alternates: {
    canonical: "/",
    languages: {
      ja: "/ja",
      en: "/en",
      zh: "/zh"
    }
  },
  openGraph: {
    title: "徳島観光PWA",
    description: "旅程生成・多言語記事・AIチャットで徳島の旅をアップデート。",
    url: siteUrl,
    siteName: "Tokushima Travel PWA",
    images: [`${siteUrl}/og/default.svg`],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    creator: "@tokushima_travel",
    site: "@tokushima_travel"
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#1f8ea8"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Suspense>
          <TrackingScript />
        </Suspense>
        <ServiceWorkerRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
