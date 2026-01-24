import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import { FirebaseClientProvider } from "@/firebase";

export const metadata: Metadata = {
  title: "Institut Islamique Yaye Halimatou Saadiya - DAARA MODERNE DE L'EXCELLENCE",
  description:
    "Institut Islamique Yaye Halimatou Saadiya - Éclairer les esprits, nourrir les âmes.",
};

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
        <FirebaseClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
