import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Route,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { HomeSearch } from "@/components/home/home-search";
import { LocationAction } from "@/components/home/location-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { featuredPujas, suggestedRoutes } from "@/data/pujas";

const zoneCards = [
  {
    description:
      "Heritage lanes, bonedi bari rituals, old-city food stops, and tightly packed classic pandals.",
    href: "/pujas/north-kolkata",
    title: "North Kolkata",
  },
  {
    description:
      "Theme-led installations, larger parks, food-friendly connectors, and late-night crowd energy.",
    href: "/pujas/south-kolkata",
    title: "South Kolkata",
  },
];

const steps = [
  {
    icon: Compass,
    title: "Choose a zone",
    text: "Start with North or South Kolkata depending on your evening plan.",
  },
  {
    icon: Sparkles,
    title: "Filter the mood",
    text: "Find famous stops, heritage pujas, theme pandals, or quieter gems.",
  },
  {
    icon: Route,
    title: "Shape the route",
    text: "Save stops, compare distance, and use suggested routes as a base.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="border-b border-border bg-surface/85">
        <Container className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div className="space-y-6">
            <Badge variant="festive">Durga Puja 2026 planner</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                PujoPath Kolkata
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Discover pujas, filter by neighborhood needs, and build a
                practical pandal-hopping path across Kolkata.
              </p>
            </div>
            <HomeSearch />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Button asChild>
                <Link href="/pujas/north-kolkata">
                  Explore pujas <ArrowRight aria-hidden="true" size={18} />
                </Link>
              </Button>
              <LocationAction />
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-lg border border-border bg-[#2d1f1a] p-6 text-primary-foreground shadow-sm">
            <div className="alpana-ring absolute -right-24 -top-24 h-64 w-64 rounded-full" />
            <div className="alpana-ring absolute -bottom-20 -left-20 h-52 w-52 rounded-full" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
              <div>
                <p className="text-sm uppercase tracking-wider text-[#f6d28e]">
                  Kolkata route board
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Find the next stop</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#f7e8d4]">
                  Search directly, browse by zone, or start from suggested
                  routes built for busy festival evenings.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md bg-white/10 p-3">
                  <MapPin aria-hidden="true" className="mb-2" size={18} />
                  Zone
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <CalendarDays aria-hidden="true" className="mb-2" size={18} />
                  Time
                </div>
                <div className="rounded-md bg-white/10 p-3">
                  <Route aria-hidden="true" className="mb-2" size={18} />
                  Route
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="space-y-12 py-10">
        <section className="space-y-4" aria-labelledby="zone-heading">
          <div>
            <p className="text-sm font-medium text-primary">Start exploring</p>
            <h2 id="zone-heading" className="text-2xl font-semibold">
              Choose your Kolkata zone
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {zoneCards.map((zone) => (
              <Link
                className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
                href={zone.href}
                key={zone.href}
              >
                <span className="text-sm font-medium text-primary">Explore</span>
                <h3 className="mt-3 text-2xl font-semibold">{zone.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {zone.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-secondary">
                  Open listings <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-primary">Featured</p>
              <h2 className="text-2xl font-semibold">Featured pujas</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredPujas.map((puja) => (
                <Card key={puja.slug}>
                  <CardHeader>
                    <Badge>{puja.zone}</Badge>
                    <CardTitle>{puja.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {puja.description}
                    </p>
                    <Button asChild variant="ghost">
                      <Link href={`/puja/${puja.slug}`}>Open details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div>
              <p className="text-sm font-medium text-primary">Routes</p>
              <h2 className="text-2xl font-semibold">Suggested routes</h2>
            </div>
            <div className="space-y-3">
              {suggestedRoutes.slice(0, 2).map((route) => (
                <Card key={route.slug}>
                  <CardHeader>
                    <CardTitle>{route.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{route.summary}</p>
                    <Button asChild variant="outline">
                      <Link href={`/routes/${route.slug}`}>View route</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>
        </section>

        <section className="space-y-4" aria-labelledby="how-heading">
          <div>
            <p className="text-sm font-medium text-primary">How it works</p>
            <h2 id="how-heading" className="text-2xl font-semibold">
              Plan without over-planning
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title}>
                  <CardHeader>
                    <Icon aria-hidden="true" className="text-secondary" size={24} />
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="disclaimer-heading"
          className="rounded-lg border border-primary/25 bg-primary/10 p-5"
        >
          <div className="flex gap-3">
            <ShieldAlert aria-hidden="true" className="mt-1 text-primary" size={22} />
            <div>
              <h2 id="disclaimer-heading" className="text-lg font-semibold">
                Festival-route disclaimer
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Puja routes, traffic rules, crowd controls, entry gates, and
                timings can change quickly during the festival. Verify locally
                before travelling, follow official instructions, and treat sample
                records as planning placeholders until verified.
              </p>
            </div>
          </div>
        </section>
      </Container>

      <footer className="border-t border-border bg-surface">
        <Container className="flex flex-col gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>PujoPath Kolkata</p>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" href="/about">
              About
            </Link>
            <Link className="hover:text-foreground" href="/routes">
              Routes
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
