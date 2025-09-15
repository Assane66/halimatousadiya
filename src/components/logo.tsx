import Link from "next/link";
import { Hexagon } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Hexagon className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold text-foreground">
        {SITE_NAME}
      </span>
    </Link>
  );
}
