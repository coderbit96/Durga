import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-[#951c14]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-[#0e5656]",
  outline:
    "border border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface-muted",
  ghost: "text-secondary hover:bg-surface-muted",
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
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
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
