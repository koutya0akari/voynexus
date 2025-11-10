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
    default: "Voynex | 徳島トラベルOS",
    template: "%s | Voynex"
  },
  description:
    "Voynexは徳島に特化したトラベルOS。microCMSで管理するスポット/記事/モデルコースとAIコンシェルジュを一つのPWAに統合。",
  alternates: {
    canonical: "/",
    languages: {
      ja: "/ja",
      en: "/en",
      zh: "/zh"
    }
  },
  openGraph: {
    title: "Voynex",
    description: "旅程生成・多言語記事・AIチャットを備えた徳島向けトラベルOS。",
    url: siteUrl,
    siteName: "Voynex",
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
