import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Institut Islamique Yaye Halimatou Saadiya - DAARA MODERNE DE L'EXCELLENCE",
  description:
    "Institut Islamique Yaye Halimatou Saadiya - Éclairer les esprits, nourrir les âmes.",
};

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      className="h-8 w-8"
      fill="currentColor"
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 .5c58.7 0 106.2 47.5 106.2 106.2 0 58.7-47.5 106.2-106.2 106.2-58.7 0-106.2-47.5-106.2-106.2 0-58.6 47.5-106.2 106.2-106.2zm81.4 152.3c-2.5 11.2-13.2 19.8-21.3 22.3-10.4 3.1-22.3 2.5-33.5-3.1-10.4-5.4-23.7-18.9-44.5-39.7-23.6-23.6-38.2-49.8-44.2-61.9-6-12.2-2.5-19.8 2.5-25.8 4.2-5.1 8.4-6.2 11.2-6.2 2.8 0 5.4 0 7.3 0 2 0 4.2.7 6.2 5.1 2 4.2 6.2 15.3 7.3 17.8s1.1 2.5.7 5.1-2.5 5.1-4.2 7.3c-1.8 1.8-3.1 3.1-4.2 5.1-1.1 2-2.5 4.2-.7 6.2 1.8 2 3.9 5.1 6.2 7.3 5.4 5.4 11.2 11.2 17.8 16.7 8.4 6.2 15.3 9.5 17.8 11.2 2.5 1.8 5.1 2.5 7.3 1.1s5.1-1.8 7.3-4.2c2.5-1.8 5.1-4.2 7.3-5.1s4.2-1.8 6.2-.7c2 1.1 13.2 6.2 15.3 7.3s3.1 1.8 3.9 2.5c.7 1.1 1.1 4.2-.7 7.3z" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Belleza&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Toaster />
        <Link
          href="https://wa.me/221786881105"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Contacter sur WhatsApp"
        >
          <WhatsAppIcon />
        </Link>
      </body>
    </html>
  );
}
