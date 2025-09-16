
import { CONTACT_INFO, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { Logo } from "../logo";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm">
            Éduquer avec foi et excellence pour un avenir brillant.
          </p>
        </div>

        <div>
          <h3 className="font-headline text-lg font-semibold text-foreground">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-headline text-lg font-semibold text-foreground">
            Nous Contacter
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              <span>
                {CONTACT_INFO.phone1} / {CONTACT_INFO.phone2}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <span>{CONTACT_INFO.email}</span>
            </li>
            <li>
              <p>{CONTACT_INFO.address}</p>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-headline text-lg font-semibold text-foreground">
            Appel à l'action
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            <p>Prêt à rejoindre notre communauté ?</p>
            <Link
              href="/contact"
              className="font-bold text-primary hover:underline"
            >
              Contactez-nous pour une inscription.
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t bg-background/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
