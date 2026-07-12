"use client";

import Link from "next/link";
import { Route } from "lucide-react";
import { usePlanStore } from "@/stores/plan";

export function MobilePlanButton() {
  const count = usePlanStore((state) => state.stops.length);
  const hydrated = usePlanStore((state) => state.hydrated);

  if (!hydrated || count === 0) {
    return null;
  }

  return (
    <Link
      className="fixed bottom-20 right-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg md:hidden"
      href="/plan"
    >
      <Route aria-hidden="true" size={18} />
      Plan {count}
    </Link>
  );
}
