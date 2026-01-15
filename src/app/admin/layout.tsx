
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
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
  FirebaseProvider,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/index';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    const { auth } = initializeFirebase();
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <FirebaseProvider>
      <FirebaseClientProvider>
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
              <div className="p-4">
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-14 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-2 md:hidden">
                  <SidebarTrigger />
                  <Logo />
                </div>
                <div className="ml-auto">
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </FirebaseClientProvider>
    </FirebaseProvider>
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
  const isActive = pathname === href;
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
