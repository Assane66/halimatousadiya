import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/logo-placeholder.svg"
        alt="Boun Nourou logo"
        width={32}
        height={32}
      />
      <span className="font-headline text-xl font-bold uppercase text-foreground">
        Boun Nourou
      </span>
    </Link>
  );
}
