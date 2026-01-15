import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <section className="bg-muted py-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {title}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                {subtitle}
                </p>
            </div>
            {children && <div>{children}</div>}
        </div>
      </div>
    </section>
  );
}
