import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { Puja } from "@/data/pujas";

type PujaListProps = {
  description: string;
  pujas: Puja[];
  title: string;
};

export function PujaList({ description, pujas, title }: PujaListProps) {
  return (
    <Container className="space-y-8 py-10">
      <div className="max-w-3xl space-y-3">
        <Badge variant="festive">Explore</Badge>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pujas.map((puja) => (
          <Card key={puja.slug}>
            <CardHeader>
              <Badge variant="teal">{puja.zone}</Badge>
              <CardTitle>{puja.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" size={16} /> {puja.area}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {puja.description}
              </p>
              <Button asChild variant="outline">
                <Link href={`/puja/${puja.slug}`}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
