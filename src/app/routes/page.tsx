import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPinned, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { publicEnv } from "@/lib/public-env";
import { listSuggestedRoutes } from "@/server/repositories/pujas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/routes" },
  description: "Suggested Durga Puja pandal-hopping routes for Kolkata.",
  openGraph: {
    title: "Suggested Puja Routes | PujoPath Kolkata",
    description: "Suggested Durga Puja pandal-hopping routes for Kolkata.",
    url: "/routes",
  },
  title: "Suggested Routes",
};

export default async function RoutesPage() {
  const routes = await listSuggestedRoutes({
    limit: 20,
    year: publicEnv.NEXT_PUBLIC_DEFAULT_PUJA_YEAR,
  });

  return (
    <Container className="space-y-8 py-10">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link className="hover:text-foreground" href="/">Home</Link> / Suggested routes
      </nav>
      <div className="max-w-3xl space-y-3">
        <Badge variant="festive">Suggested Routes</Badge>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Kolkata Puja routes by mood, time, and movement.
        </h1>
        <p className="text-muted-foreground">
          Sample routes are development data until verified for the current festival year.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.items.map((route) => (
          <Card key={route.slug}>
            <CardHeader>
              <Route aria-hidden="true" className="text-secondary" size={24} />
              <CardTitle>{route.name.en}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {route.summary.en}
              </p>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock aria-hidden="true" size={16} /> {route.durationMinutes} min
                </p>
                {route.distanceMeters ? (
                  <p className="flex items-center gap-2">
                    <MapPinned aria-hidden="true" size={16} />{" "}
                    {(route.distanceMeters / 1000).toFixed(1)} km
                  </p>
                ) : null}
                <p>Mode: {route.travelMode}</p>
                {route.zone ? <p>Zone: {route.zone}</p> : null}
              </div>
              <Button asChild variant="outline">
                <Link href={`/routes/${route.slug}`}>Open route</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
