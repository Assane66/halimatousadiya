
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="https://res.cloudinary.com/dm6yuokre/image/upload/v1758049733/logo_vv7gpn.jpg"
        alt="Institut Islamique Yaye Halimatou Saadiya logo"
        width={48}
        height={48}
      />
    </Link>
  );
}
