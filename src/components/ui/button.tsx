import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,208,0,0.22)] hover:bg-accent",
  secondary:
    "border border-primary/45 bg-secondary text-secondary-foreground hover:border-primary hover:bg-surface-muted",
  outline:
    "border border-border bg-surface/80 text-foreground hover:border-primary/70 hover:bg-surface-muted hover:text-primary",
  ghost: "text-primary hover:bg-primary/10",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: false;
  variant?: keyof typeof variants;
};

type ButtonAsChildProps = {
  asChild: true;
  children: ReactElement<{ className?: string }>;
  className?: string;
  variant?: keyof typeof variants;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps | ButtonAsChildProps>(
function Button(props, ref) {
  const { asChild, className, variant = "primary", ...rest } = props;
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  );

  if (asChild) {
    if (!isValidElement(rest.children)) {
      return null;
    }

    const child = rest.children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      className={classes}
      ref={ref}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
});
