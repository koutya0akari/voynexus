import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const messages = (await import(`../locales/${currentLocale}.json`)).default;

  return { locale: currentLocale, messages };
});
