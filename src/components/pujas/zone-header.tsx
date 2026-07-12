import { Badge } from "@/components/ui/badge";

type ZoneHeaderProps = {
  description: string;
  title: string;
};

export function ZoneHeader({ description, title }: ZoneHeaderProps) {
  return (
    <div className="space-y-3">
      <Badge variant="festive">Explore</Badge>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
