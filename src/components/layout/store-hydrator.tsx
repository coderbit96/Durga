"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites";
import { useLanguageStore } from "@/stores/language";
import { usePlanStore } from "@/stores/plan";

export function StoreHydrator() {
  useEffect(() => {
    void useFavoritesStore.persist.rehydrate();
    void useLanguageStore.persist.rehydrate();
    void usePlanStore.persist.rehydrate();
  }, []);

  return null;
}
