import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <section className={cn("bg-muted py-12 md:py-16", className)}>
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
