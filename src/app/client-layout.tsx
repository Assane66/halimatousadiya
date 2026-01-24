
'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <>
                {children}
                <Toaster />
                <SonnerToaster position="top-right" expand={true} richColors />
            </>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
            <SonnerToaster position="top-right" expand={true} richColors />
            <Link
                href="https://wa.me/221786881105"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-transparent text-white shadow-lg transition-transform hover:scale-110"
                aria-label="Contacter sur WhatsApp"
            >
                <Image
                    src="https://res.cloudinary.com/dm6yuokre/image/upload/v1752163214/Pngtree_whatsapp_icon_whatsapp_logo_3584844_qnvcmv.png"
                    alt="WhatsApp"
                    width={64}
                    height={64}
                    className="rounded-full"
                />
            </Link>
        </div>
    );
}
