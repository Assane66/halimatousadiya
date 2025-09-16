
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary/80 text-primary-foreground">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 text-xs">
          <div className="hidden items-center gap-6 md:flex">
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
          <div className="flex flex-1 items-center justify-end gap-4">
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
