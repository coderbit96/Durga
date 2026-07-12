import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <Container className="space-y-6 py-10">
      <div className="max-w-3xl space-y-3">
        <Badge variant="festive">About</Badge>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Built for Kolkata Puja movement.
        </h1>
        <p className="text-muted-foreground">
          PujoPath Kolkata is a production-ready foundation for discovering
          pujas, planning stops, and sharing suggested pandal routes during
          Durga Puja.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Project direction</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-muted-foreground md:grid-cols-3">
          <p>Mobile-first navigation for crowded street use.</p>
          <p>Subtle alpana patterns and tram-line inspired route language.</p>
          <p>No authentication or admin panel in this starter.</p>
        </CardContent>
      </Card>
    </Container>
  );
}
