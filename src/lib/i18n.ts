import type { LocalizedText } from "@/domain";

export const languages = ["en", "bn"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";
export const languageCookieName = "pujopath_language";

const dictionaries = {
  en: {
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.plan": "Plan",
    "nav.favorites": "Favorites",
    "nav.routes": "Suggested Routes",
    "nav.mobileRoutes": "Routes",
    "language.label": "Language",
    "language.en": "English",
    "language.bn": "বাংলা",
    "common.verified": "Verified",
    "common.unverified": "Pending verification",
    "common.disclaimer":
      "Traffic, barricades, police instructions, and temporary access rules can change during Durga Puja.",
  },
  bn: {
    "nav.home": "হোম",
    "nav.explore": "ঘুরে দেখুন",
    "nav.plan": "পরিকল্পনা",
    "nav.favorites": "প্রিয়",
    "nav.routes": "প্রস্তাবিত রুট",
    "nav.mobileRoutes": "রুট",
    "language.label": "ভাষা",
    "language.en": "English",
    "language.bn": "বাংলা",
    "common.verified": "যাচাইকৃত",
    "common.unverified": "অযাচাইকৃত নমুনা",
    "common.disclaimer":
      "দুর্গাপুজোর সময় যানচলাচল, ব্যারিকেড, পুলিশের নির্দেশ এবং সাময়িক প্রবেশপথ বদলাতে পারে।",
  },
} satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof dictionaries.en;

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

export function translate(language: Language, key: TranslationKey) {
  return dictionaries[language][key] ?? dictionaries.en[key];
}

export function selectLocalized(text: LocalizedText | undefined, language: Language) {
  if (!text) {
    return "";
  }

  return text[language] || text.en;
}
