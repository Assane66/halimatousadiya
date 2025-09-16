import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/logo-placeholder.svg"
        alt="Institut Islamique Yaye Halimatou Saadiya logo"
        width={48}
        height={48}
      />
      <span className="font-headline text-lg font-bold uppercase text-foreground">
        Institut Islamique Yaye Halimatou Saadiya
      </span>
    </Link>
  );
}
