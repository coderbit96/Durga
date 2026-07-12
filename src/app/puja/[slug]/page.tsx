import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Accessibility,
  BadgeCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  Landmark,
  MapPin,
  ShieldAlert,
  TrainFront,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PujaActions } from "@/components/puja-detail/puja-actions";
import { PujaMapSection } from "@/components/puja-detail/puja-map-section";
import { SinglePandalDirections } from "@/components/puja-detail/single-pandal-directions";
import { publicEnv } from "@/lib/public-env";
import { getExternalNavigationUrl } from "@/lib/maps/provider";
import { getPujaBySlug } from "@/server/repositories/pujas";
import type { Puja } from "@/domain";

type PujaPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function formatZone(zone: string) {
  return zone
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

async function loadPuja(slug: string) {
  try {
    return await getPujaBySlug(slug, {
      includeUnverified: process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PujaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const puja = await loadPuja(slug);
  const canonical = `/puja/${puja.slug}`;
  const title = `${puja.name.en} | PujoPath Kolkata`;
  const description = puja.themeDescription.en;

  return {
    alternates: {
      canonical,
    },
    description,
    metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
    openGraph: {
      description,
      locale: "en_IN",
      siteName: "PujoPath Kolkata",
      title,
      type: "website",
      url: canonical,
    },
    robots: puja.verified ? undefined : { follow: true, index: false },
    title,
  };
}

function JsonLd({ puja, url }: { puja: Puja; url: string }) {
  const [longitude, latitude] = puja.location.coordinates;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    address: puja.address.en,
    description: puja.themeDescription.en,
    geo: {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    },
    isAccessibleForFree: true,
    name: puja.name.en,
    publicAccess: true,
    url,
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ "aria-hidden": true; size: number }>;
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex gap-3 text-sm">
      <Icon aria-hidden={true} size={18} />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export default async function PujaDetailsPage({ params }: PujaPageProps) {
  const { slug } = await params;
  const puja = await loadPuja(slug);
  const pageUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/puja/${puja.slug}`;
  const navigationUrl = getExternalNavigationUrl({
    destination: puja.location,
    travelMode: "walking",
  });

  return (
    <>
      <JsonLd puja={puja} url={pageUrl} />
      <Container className="space-y-8 py-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="festive">{formatZone(puja.zone)}</Badge>
              {puja.tags.includes("famous") ? (
                <Badge variant="festive">Famous</Badge>
              ) : null}
              {puja.tags.includes("hidden-gem") ? (
                <Badge variant="teal">Hidden gem</Badge>
              ) : null}
              {puja.categories.map((category) => (
                <Badge key={category}>{category}</Badge>
              ))}
              <Badge variant={puja.verified ? "teal" : "default"}>
                {puja.verified ? "Verified" : "Pending verification"}
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary">Data year {puja.year}</p>
              <h1 className="text-3xl font-semibold sm:text-5xl">{puja.name.en}</h1>
              {puja.committeeName ? (
                <p className="text-lg text-muted-foreground">
                  {puja.committeeName.en}
                </p>
              ) : null}
              <h2 className="text-2xl font-semibold">{puja.themeTitle.en}</h2>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {puja.themeDescription.en}
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <PujaActions
                navigationUrl={navigationUrl}
                shareUrl={pageUrl}
                slug={puja.slug}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {puja.images.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {puja.images.map((image) => (
                      <Image
                        alt={image.alt.en}
                        className="aspect-video rounded-md object-cover"
                        height={image.height ?? 720}
                        key={image.url}
                        src={image.url}
                        width={image.width ?? 1280}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-56 place-items-center rounded-md bg-surface-muted p-6 text-center text-sm text-muted-foreground">
                    Gallery images are not available for this record yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <section className="space-y-3" aria-labelledby="map-heading">
              <h2 id="map-heading" className="text-2xl font-semibold">
                Map
              </h2>
              <PujaMapSection label={puja.name.en} point={puja.location} />
            </section>

            <SinglePandalDirections
              destination={puja.location}
              destinationName={puja.name.en}
            />

            <Card className="border-primary/25 bg-primary/10">
              <CardContent className="flex gap-3 p-5">
                <ShieldAlert aria-hidden="true" className="mt-1 text-primary" size={22} />
                <div>
                  <h2 className="font-semibold">Festival access warning</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Traffic flow, barricades, queue gates, entry/exit rules, and
                    police instructions can change quickly during Durga Puja.
                    Verify locally before travelling.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visit details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={MapPin} label="Address" value={puja.address.en} />
                <InfoRow
                  icon={Landmark}
                  label="Nearby landmark"
                  value={puja.nearbyLandmark.en}
                />
                <InfoRow icon={TrainFront} label="Nearest metro" value={puja.nearestMetro} />
                <InfoRow
                  icon={TrainFront}
                  label="Nearest railway station"
                  value={puja.nearestRailwayStation}
                />
                <InfoRow
                  icon={MapPin}
                  label="Recommended entry"
                  value={puja.recommendedEntry.en}
                />
                <InfoRow icon={MapPin} label="Recommended exit" value={puja.exitRecommendation.en} />
                <InfoRow icon={Clock} label="Best visit time" value={puja.bestVisitTime.en} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex gap-2">
                  <Accessibility aria-hidden="true" size={18} />
                  Wheelchair access: {puja.accessibility.wheelchairAccess ? "Yes" : "No"}
                </p>
                <p>Senior friendly: {puja.accessibility.seniorFriendly ? "Yes" : "No"}</p>
                <p>Crowd level: {puja.accessibility.crowdLevel}</p>
                {puja.accessibility.notes ? <p>{puja.accessibility.notes.en}</p> : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex gap-2">
                  <BadgeCheck aria-hidden="true" size={18} />
                  {puja.verified ? "Verified" : "Not verified"}
                </p>
                <p className="flex gap-2">
                  <CalendarDays aria-hidden="true" size={18} />
                  Last checked {formatDate(puja.lastVerifiedAt)}
                </p>
                <p>{puja.sourceNote.en}</p>
              </CardContent>
            </Card>

            {Object.values(puja.officialLinks).some(Boolean) ? (
              <Card>
                <CardHeader>
                  <CardTitle>Official links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(puja.officialLinks).map(([label, href]) =>
                    href ? (
                      <a
                        className="flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
                        href={href}
                        key={label}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink aria-hidden="true" size={16} />
                        {label}
                      </a>
                    ) : null,
                  )}
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </section>
      </Container>
    </>
  );
}
