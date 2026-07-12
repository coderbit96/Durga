"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { publicEnv } from "@/lib/public-env";
import type { AppTravelMode } from "@/domain";
import type { CurrentLocation } from "@/lib/location/state";

export type PlanState = {
  addStop: (slug: string) => boolean;
  clear: () => void;
  hydrated: boolean;
  manualOrder?: string[];
  optimized: boolean;
  removeStop: (slug: string) => void;
  reorderStops: (stops: string[]) => void;
  setHydrated: (hydrated: boolean) => void;
  setOptimizedOrder: (stops: string[]) => void;
  setStartLocation: (location?: CurrentLocation) => void;
  setTravelMode: (mode: AppTravelMode) => void;
  startLocation?: CurrentLocation;
  stops: string[];
  travelMode: AppTravelMode;
};

export const maxPlanStops = publicEnv.NEXT_PUBLIC_MAX_PLAN_STOPS;

function uniqueStops(stops: string[]) {
  return Array.from(new Set(stops));
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      addStop: (slug) => {
        const state = get();
        if (state.stops.includes(slug) || state.stops.length >= maxPlanStops) {
          return false;
        }
        set({ optimized: false, stops: [...state.stops, slug] });
        return true;
      },
      clear: () =>
        set({
          manualOrder: undefined,
          optimized: false,
          startLocation: undefined,
          stops: [],
        }),
      hydrated: false,
      optimized: false,
      removeStop: (slug) =>
        set((state) => ({
          optimized: false,
          stops: state.stops.filter((stop) => stop !== slug),
        })),
      reorderStops: (stops) =>
        set({ optimized: false, stops: uniqueStops(stops).slice(0, maxPlanStops) }),
      setHydrated: (hydrated) => set({ hydrated }),
      setOptimizedOrder: (stops) =>
        set((state) => ({
          manualOrder: state.optimized ? state.manualOrder : state.stops,
          optimized: true,
          stops: uniqueStops(stops).slice(0, maxPlanStops),
        })),
      setStartLocation: (location) => set({ startLocation: location }),
      setTravelMode: (travelMode) => set({ travelMode }),
      stops: [],
      travelMode: "walking",
    }),
    {
      migrate: (persisted, version) => {
        const state = persisted as Partial<PlanState> & { items?: string[] };
        if (version < 2 && state.items) {
          return { ...state, stops: state.items };
        }
        return state;
      },
      name: "pujopath-plan-v2",
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({
        manualOrder: state.manualOrder,
        optimized: state.optimized,
        startLocation: state.startLocation,
        stops: state.stops,
        travelMode: state.travelMode,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);

export function createPlanTestStore(maxStops = 8) {
  let stops: string[] = [];
  let travelMode: AppTravelMode = "walking";
  let startLocation: CurrentLocation | undefined;

  return {
    addStop(slug: string) {
      if (stops.includes(slug) || stops.length >= maxStops) {
        return false;
      }
      stops = [...stops, slug];
      return true;
    },
    clear() {
      stops = [];
      startLocation = undefined;
    },
    removeStop(slug: string) {
      stops = stops.filter((stop) => stop !== slug);
    },
    reorderStops(next: string[]) {
      stops = uniqueStops(next).slice(0, maxStops);
    },
    setStartLocation(location?: CurrentLocation) {
      startLocation = location;
    },
    setTravelMode(mode: AppTravelMode) {
      travelMode = mode;
    },
    snapshot() {
      return { startLocation, stops, travelMode };
    },
  };
}
