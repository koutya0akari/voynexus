export const locales = ["ja", "en", "zh", "ko"] as const;
export const defaultLocale = "ja";

export type Locale = (typeof locales)[number];

export function isSupportedLocale(input: string): input is Locale {
  return locales.includes(input as Locale);
}

export async function getMessages(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("@/locales/en.json")).default;
    case "zh":
      return (await import("@/locales/zh.json")).default;
    case "ko":
      return (await import("@/locales/ko.json")).default;
    default:
      return (await import("@/locales/ja.json")).default;
  }
}
