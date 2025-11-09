import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/navigation/footer";
import { MainNav } from "@/components/navigation/main-nav";
import { locales, isSupportedLocale, getMessages, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

type Props = {
  children: ReactNode;
  params: { lang: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.lang;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale as Locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col bg-white">
        <MainNav locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
