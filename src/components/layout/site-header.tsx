
import Link from "next/link";
import {
  Menu,
  MapPin,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown,
} from "lucide-react";

import { NAV_LINKS, CONTACT_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.75 13.96c.25.13.43.2.5.28.08.1.13.2.18.33.05.13.08.23.08.3s-.03.2-.08.28c-.05.08-.13.15-.23.2l-1.05.58c-.15.08-.3.13-.48.13-.3 0-.58-.1-.8-.3-.23-.2-.5-.45-.8-.73-.28-.28-.53-.58-.75-.9s-.4-.68-.55-1.08c-.15-.4-.23-.8-.23-1.23v-.05c0-.15.03-.3.08-.43s.13-.25.2-.35.18-.2.28-.25.2-.08.3-.08h.1c.13 0 .25.03.38.08l.7.35c.18.1.3.2.38.3.08.1.13.23.13.35 0 .1-.03.2-.08.28-.05.1-.1.18-.18.23l-.25.13c-.08.05-.13.1-.13.15s0 .1.05.13c.05.05.1.1.18.18.17.17.38.37.6.6.23.23.43.43.6.6.05.03.1.05.13.05s.08-.03.13-.05zM12 2a10 10 0 100 20 10 10 0 000-20zm0 18.5c-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5 8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z" />
  </svg>
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary/80 text-primary-foreground">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{CONTACT_INFO.address.split(",")[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="hover:underline"
              >
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://web.facebook.com/profile.php?id=61578747932815"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-opacity hover:opacity-80"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://www.instagram.com/daarahalimatou_saadiya/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-opacity hover:opacity-80"
            >
              <Instagram size={16} />
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs"
            >
              French <ChevronDown size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex h-20 items-center">
        <div className="mr-8">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-8">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="hidden md:flex" size="lg">
            <Link href="/contact">S'INSCRIRE</Link>
          </Button>

          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="p-4">
          <Logo />
        </div>
        <div className="flex flex-col space-y-4 p-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
           <Button asChild className="mt-4" size="lg">
            <Link href="/contact">S'INSCRIRE</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
