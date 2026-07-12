import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-4 py-12">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-3xl font-semibold">This pandal is not on the map.</h1>
      <p className="max-w-xl text-muted-foreground">
        The page may have moved, or the route has not been added yet.
      </p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </Container>
  );
}
