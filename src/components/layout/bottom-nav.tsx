"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, Home, Route, Search } from "lucide-react";
import { translate, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/language";

const links = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/pujas/north-kolkata", icon: Search, labelKey: "nav.explore" },
  { href: "/plan", icon: CalendarDays, labelKey: "nav.plan" },
  { href: "/favorites", icon: Heart, labelKey: "nav.favorites" },
  { href: "/routes", icon: Route, labelKey: "nav.mobileRoutes" },
];

export function BottomNav() {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/25 bg-[#070705]/95 shadow-lg backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary",
                active && "text-primary",
              )}
              href={link.href}
              key={link.href}
            >
              <Icon aria-hidden="true" size={20} />
              <span>{translate(language, link.labelKey as TranslationKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
