"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  defaultLanguage,
  isLanguage,
  languageCookieName,
  type Language,
} from "@/lib/i18n";

type LanguageState = {
  hydrated: boolean;
  language: Language;
  setHydrated: () => void;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      hydrated: false,
      language: defaultLanguage,
      setHydrated: () => set({ hydrated: true }),
      setLanguage: (language) => {
        if (typeof document !== "undefined") {
          document.cookie = `${languageCookieName}=${language}; path=/; max-age=31536000; samesite=lax`;
          document.documentElement.lang = language;
        }
        set({ language });
      },
    }),
    {
      name: "pujopath-language-v1",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!isLanguage(state.language)) {
            state.language = defaultLanguage;
          }
          state.setHydrated();
        }
      },
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
