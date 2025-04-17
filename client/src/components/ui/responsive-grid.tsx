import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export function ResponsiveGrid({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "gap-4",
  className,
  ...props
}: ResponsiveGridProps) {
  // Generate responsive grid classes based on cols
  const gridClasses = cn(
    "grid",
    gap,
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
}

export function CompactCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg shadow-sm border p-4 h-full flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CompactCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CompactCardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-tight text-base", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CompactCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-grow", className)} {...props}>
      {children}
    </div>
  );
}

export function CompactCardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-3 mt-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}