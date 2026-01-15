
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  useUser,
  FirebaseClientProvider,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

function AdminApp({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on n'est pas sur la page de login, que le chargement est terminé et qu'il n'y a pas d'utilisateur,
    // on redirige vers la page de login.
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router, pathname]);

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Pendant le chargement, on peut afficher un loader
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Si on est sur la page de login, on affiche juste son contenu
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Si l'utilisateur n'est pas connecté et qu'on n'est pas sur la page de login
  // (ce cas est géré par le useEffect, mais c'est une sécurité supplémentaire)
  if (!user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  // Si l'utilisateur est connecté, on affiche le layout de l'admin
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {ADMIN_NAV_LINKS.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <AdminSidebarMenuButton href={link.href}>
                      {link.label}
                    </AdminSidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:justify-end">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AdminApp>{children}</AdminApp>
    </FirebaseClientProvider>
  );
}

function AdminSidebarMenuButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Button
      asChild
      variant={isActive ? 'default' : 'ghost'}
      className="w-full justify-start"
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
