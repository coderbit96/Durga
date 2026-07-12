"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Container } from "@/components/ui/container";
import { translate, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/language";

const navLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/pujas/north-kolkata", labelKey: "nav.explore" },
  { href: "/plan", labelKey: "nav.plan" },
  { href: "/favorites", labelKey: "nav.favorites" },
  { href: "/routes", labelKey: "nav.routes" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/25 bg-[#070705]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,208,0,0.35)]">
            <Compass aria-hidden="true" size={20} />
          </span>
          <span>PujoPath Kolkata</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1" aria-label="Primary">
            {navLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary",
                    active && "bg-primary/15 text-primary",
                  )}
                  href={link.href}
                  key={link.href}
                >
                  {translate(language, link.labelKey as TranslationKey)}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
        </div>
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
