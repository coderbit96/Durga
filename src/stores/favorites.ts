"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoritesState = {
  add: (slug: string) => void;
  clear: () => void;
  hydrated: boolean;
  ids: string[];
  remove: (slug: string) => void;
  setHydrated: (hydrated: boolean) => void;
  toggle: (slug: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      add: (slug) =>
        set((state) => ({
          ids: state.ids.includes(slug) ? state.ids : [...state.ids, slug],
        })),
      clear: () => set({ ids: [] }),
      hydrated: false,
      ids: [],
      remove: (slug) =>
        set((state) => ({ ids: state.ids.filter((item) => item !== slug) })),
      setHydrated: (hydrated) => set({ hydrated }),
      toggle: (slug) => {
        if (get().ids.includes(slug)) {
          get().remove(slug);
        } else {
          get().add(slug);
        }
      },
    }),
    {
      name: "pujopath-favorites-v1",
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({ ids: state.ids }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function createFavoritesTestStore(initial: string[] = []) {
  let ids = initial;
  return {
    add(slug: string) {
      ids = ids.includes(slug) ? ids : [...ids, slug];
      return ids;
    },
    clear() {
      ids = [];
      return ids;
    },
    ids() {
      return ids;
    },
    remove(slug: string) {
      ids = ids.filter((item) => item !== slug);
      return ids;
    },
    toggle(slug: string) {
      ids = ids.includes(slug)
        ? ids.filter((item) => item !== slug)
        : [...ids, slug];
      return ids;
    },
  };
}
