
'use client';

import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"


export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(pathname);
  const isLandingPage = pathname === '/';
  
  const isAdmin = user && user.isAdmin;

  if (isLandingPage) {
    return <>{children}</>;
  }

  if (isAuthRoute) {
     return <>{children}</>;
  }

  if (isAdminRoute) {
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>您没有权限访问此页面。</p>
            </div>
        )
    }
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden md:block fixed h-full">
           <AdminSidebar />
        </div>
        <div className="md:hidden fixed top-4 left-4 z-50">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                 <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">{children}</main>
    </div>
  );
}
