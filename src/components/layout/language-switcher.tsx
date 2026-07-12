"use client";

import { Globe2 } from "lucide-react";
import { languages, translate, type Language } from "@/lib/i18n";
import { useLanguageStore } from "@/stores/language";

export function LanguageSwitcher() {
  const language = useLanguageStore((state) => state.language);
  const hydrated = useLanguageStore((state) => state.hydrated);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-sm text-muted-foreground">
      <Globe2 aria-hidden="true" size={16} />
      <span className="sr-only">{translate(language, "language.label")}</span>
      <select
        aria-label={translate(language, "language.label")}
        className="bg-transparent text-foreground outline-none"
        onChange={(event) => setLanguage(event.target.value as Language)}
        value={hydrated ? language : "en"}
      >
        {languages.map((item) => (
          <option key={item} value={item}>
            {translate(item, `language.${item}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
