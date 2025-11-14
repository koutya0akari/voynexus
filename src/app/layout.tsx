import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { auth } from "@/auth";
import { TrackingScript } from "@/components/tracking-script";
import { Toaster } from "@/components/toaster";
import { ServiceWorkerRegister } from "@/components/pwa-register";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ensureMembershipCookie } from "@/lib/membership-sync";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voynexusus.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "voynexus | トラベルOS",
    template: "%s | voynexus",
  },
  description:
    "voynexusは全国に対応したトラベルOS。天候と交通に合わせたAI旅程、現地レポート、多言語コンシェルジュをまとめて提供します。",
  alternates: {
    canonical: "/",
    languages: {
      ja: "/ja",
      en: "/en",
      zh: "/zh",
    },
  },
  openGraph: {
    title: "voynexus",
    description: "旅程生成・多言語記事・AIチャットを備えた全国向けトラベルOS。",
    url: siteUrl,
    siteName: "voynexus",
    images: [`${siteUrl}/og/default.svg`],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@voynexusus",
    site: "@voynexusus",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
  },
};

export const viewport: Viewport = {
  themeColor: "#1f8ea8",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  await ensureMembershipCookie(session?.user?.id);
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4546548443078272"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Suspense>
          <TrackingScript />
        </Suspense>
        <ServiceWorkerRegister />
        <AuthSessionProvider session={session}>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
