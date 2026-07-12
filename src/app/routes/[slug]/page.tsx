import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { UseRouteButton } from "@/components/routes/use-route-button";
import { MapView } from "@/components/maps/map-view";
import { getSuggestedRouteBySlug, listPujas } from "@/server/repositories/pujas";

type RoutePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

async function loadRoute(slug: string) {
  try {
    return await getSuggestedRouteBySlug(slug);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await loadRoute(slug);
  return {
    alternates: { canonical: `/routes/${route.slug}` },
    description: route.summary.en,
    openGraph: {
      description: route.summary.en,
      title: `${route.name.en} | PujoPath Kolkata`,
      url: `/routes/${route.slug}`,
    },
    title: route.name.en,
  };
}

export default async function SuggestedRoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = await loadRoute(slug);
  const pujas = await listPujas({
    includeUnverified: true,
    limit: 50,
    year: route.year,
  });
  const pujaBySlug = new Map(pujas.items.map((puja) => [puja.slug, puja]));
  const stops = route.stops.map((stop) => ({
    routeStop: stop,
    puja: pujaBySlug.get(stop.pujaSlug),
  }));
  const unavailable = stops.filter((stop) => !stop.puja);

  return (
    <Container className="space-y-6 py-10">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link className="hover:text-foreground" href="/">Home</Link> /{" "}
        <Link className="hover:text-foreground" href="/routes">Routes</Link> /{" "}
        {route.name.en}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <Badge variant="festive">Suggested route</Badge>
          <h1 className="text-3xl font-semibold sm:text-5xl">{route.name.en}</h1>
          <p className="text-lg leading-8 text-muted-foreground">{route.description.en}</p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {route.zone ? <Badge>{route.zone}</Badge> : null}
            <span className="flex items-center gap-2"><Clock aria-hidden="true" size={16} /> {route.durationMinutes} min</span>
            {route.distanceMeters ? <span className="flex items-center gap-2"><MapPinned aria-hidden="true" size={16} /> {(route.distanceMeters / 1000).toFixed(1)} km</span> : null}
            <span>Mode: {route.travelMode}</span>
          </div>
          {unavailable.length ? (
            <Card className="border-primary/25 bg-primary/10 p-4 text-sm">
              Some referenced pujas are unavailable for {route.year}. This route
              may need an update before use.
            </Card>
          ) : null}
          <MapView
            markers={stops
              .filter((stop) => stop.puja)
              .map((stop, index) => ({
                id: stop.routeStop.pujaSlug,
                label: `${index + 1}. ${stop.puja!.name.en}`,
                point: stop.puja!.location,
              }))}
            routePoints={stops.filter((stop) => stop.puja).map((stop) => stop.puja!.location)}
          />
        </section>
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Use this route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can change your start location in My Puja Plan before optimizing.
              </p>
              <UseRouteButton
                stops={stops.filter((stop) => stop.puja).map((stop) => stop.routeStop.pujaSlug)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Puja stops</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {stops.map((stop, index) => (
                  <li className="rounded-md border border-border bg-surface-muted p-3 text-sm" key={`${stop.routeStop.pujaSlug}-${index}`}>
                    <span className="font-medium text-primary">Stop {index + 1}</span>
                    {stop.puja ? (
                      <Link className="mt-1 block font-semibold hover:underline" href={`/puja/${stop.puja.slug}`}>
                        {stop.puja.name.en}
                      </Link>
                    ) : (
                      <p className="mt-1 font-semibold">Unavailable: {stop.routeStop.pujaSlug}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
