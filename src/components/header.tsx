
"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  // Show back button on all pages except for the main landing page and home.
  const showBackButton = !['/', '/home'].includes(pathname) && !pathname.startsWith('/admin');

  return (
    <header className="fixed top-6 left-4 right-4 z-50 flex justify-between items-center">
      <div>
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
            aria-label="返回"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
           <Link href="/admin/dashboard" passHref>
             <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
                aria-label="后台管理"
              >
                <ShieldCheck className="h-6 w-6" />
              </Button>
          </Link>
        )}
        <Link href={isLoggedIn ? "/profile" : "/login"} passHref>
           <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
              aria-label="个人资料"
            >
              <User className="h-6 w-6" />
            </Button>
        </Link>
      </div>
    </header>
  );
}
