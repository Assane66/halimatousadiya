
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={SITE_NAME}>
      <Image
        src="https://res.cloudinary.com/dm6yuokre/image/upload/v1758049733/logo_vv7gpn.jpg"
        alt={`${SITE_NAME} Logo`}
        width={50}
        height={50}
        className="rounded-full"
      />
    </Link>
  );
}
