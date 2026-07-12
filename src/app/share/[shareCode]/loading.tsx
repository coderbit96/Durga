import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SharedPlanLoading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-64" />
    </Container>
  );
}
