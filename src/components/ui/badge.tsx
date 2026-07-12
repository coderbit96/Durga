import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-surface-muted text-foreground",
  festive: "border-primary/40 bg-primary/15 text-primary",
  teal: "border-accent/40 bg-accent/15 text-accent",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
