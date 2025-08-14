'use client';

import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    getSiteContent().then(setSiteContent);
  }, []);

  const isHomePage = pathname === '/home';
  const hasHomeBg = isHomePage && siteContent?.homeBackgroundImageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {hasHomeBg && (
        <div className="fixed inset-0 -z-10">
          <Image
            src={siteContent.homeBackgroundImageUrl!}
            alt="Homepage Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
        </div>
      )}
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-8">{children}</main>
    </div>
  );
}
