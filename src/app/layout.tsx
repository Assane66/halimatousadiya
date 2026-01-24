import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import { FirebaseClientProvider } from "@/firebase";

export const metadata: Metadata = {
  metadataBase: new URL('https://yayehalimatousaadiya.com'),
  title: {
    default: "Institut Islamique Yaye Halimatou Saadiya - DAARA MODERNE DE L'EXCELLENCE",
    template: "%s | Institut YHS"
  },
  description:
    "Institut Islamique Yaye Halimatou Saadiya à Tivaouane Peulh. Excellence académique, mémorisation du Coran et éducation islamique de qualité.",
  keywords: ["institut islamique", "daara moderne", "Tivaouane Peulh", "éducation islamique", "Sénégal", "mémorisation coran", "école franco-arabe"],
  authors: [{ name: "Yaye Halimatou Saadiya" }],
  creator: "Admin YHS",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://yayehalimatousaadiya.com",
    title: "Institut Islamique Yaye Halimatou Saadiya",
    description: "Éclairer les esprits, nourrir les âmes. Daara Moderne de l'Excellence à Tivaouane Peulh.",
    siteName: "Institut Yaye Halimatou Saadiya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Institut Islamique Yaye Halimatou Saadiya",
    description: "Éducation islamique et académique d'excellence.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
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
