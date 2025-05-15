import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Breadcrumb = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center flex-wrap text-sm",
        className
      )}
      {...props}
    />
  );
});

Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => {
  return (
    <ol
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 flex-wrap",
        className
      )}
      {...props}
    />
  );
});

BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
});

BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : Link;
  return (
    <Comp
      ref={ref}
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline",
        className
      )}
      {...props}
    />
  );
});

BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-muted-foreground mx-1", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </span>
  );
});

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-foreground font-medium", className)}
      {...props}
    />
  );
});

BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbHome = () => {
  return (
    <Link
      to="/"
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Trang chủ"
    >
      <Home className="h-4 w-4" />
    </Link>
  );
};

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbHome,
}; 