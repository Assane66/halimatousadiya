
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
  SidebarMenuButton as ShadcnSidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  useUser,
  useFirestore,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  LogOut,
  LayoutDashboard,
  Newspaper,
  Image as ImageIcon,
  Users,
  Calendar,
  School,
  GraduationCap,
  Wallet,
  UserCircle,
  MessageSquare
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Newspaper,
  Image: ImageIcon,
  Users,
  Calendar,
  School,
  GraduationCap,
  Wallet,
  Messages: MessageSquare,
};

function AdminApp({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Auto-bootstrap: Add user to roles_admin if they are logged in
  useEffect(() => {
    async function bootstrapAdmin() {
      if (user && firestore) {
        try {
          const { doc, setDoc, getDoc } = await import('firebase/firestore');
          const adminRef = doc(firestore, 'roles_admin', user.uid);
          const adminSnap = await getDoc(adminRef);

          if (!adminSnap.exists()) {
            console.log("Bootstrapping admin role for:", user.email);
            await setDoc(adminRef, {
              email: user.email,
              id: user.uid,
              role: 'admin',
              createdAt: new Date()
            });
          }
        } catch (e) {
          console.warn("Could not auto-bootstrap admin role. Rules might be too strict.", e);
        }
      }
    }
    bootstrapAdmin();
  }, [user, firestore]);

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-emerald-700 font-medium">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r border-slate-200/50 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="p-6">
            <Logo />
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarMenu className="gap-1">
                {ADMIN_NAV_LINKS.map((link) => {
                  const Icon = ICON_MAP[link.icon || ''] || LayoutDashboard;
                  const isActive = pathname === link.href;
                  return (
                    <SidebarMenuItem key={link.href}>
                      <ShadcnSidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`
                          flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                            : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'}
                        `}
                      >
                        <Link href={link.href}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </ShadcnSidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-6 space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <UserCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-500 truncate">Administrateur</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </Button>
          </div>
        </Sidebar>
        <SidebarInset className="bg-[#f8fafc]">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/50 bg-white/80 px-8 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900 capitalize">
                  {pathname.split('/').pop()?.replace('-', ' ')}
                </h1>
                <p className="text-xs text-slate-500">Institut Islamique Yaye Halimatou Saadiya</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Session Active</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
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
    <AdminApp>{children}</AdminApp>
  );
}

