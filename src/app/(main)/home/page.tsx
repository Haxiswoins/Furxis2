'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactInfo } from '@/components/contact-info';

function HomeCardSkeleton() {
  return (
     <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-muted">
       <Skeleton className="w-full h-full" />
       <div className="absolute inset-0 flex flex-col justify-end p-8">
           <Skeleton className="h-10 w-3/4" />
           <Skeleton className="h-6 w-1/2 mt-3" />
       </div>
    </div>
  )
}


export default function HomePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then(data => {
        if (data) {
          setContent(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12 relative">
          <Link href="/">
              <div className="relative inline-block cursor-pointer group">
                  <h1 className="relative z-10 text-5xl font-headline hover:text-primary transition-colors duration-300 tracking-widest font-bold">前行无界</h1>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-primary font-code text-4xl font-thin tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                      FORWARD INFINITY
                  </span>
              </div>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl">
            
            {loading ? <HomeCardSkeleton /> : (
              <Link href="/commission" className="group w-full md:w-2/5">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={content?.commissionImageUrl || "https://placehold.co/600x800.png"}
                    alt="委托申请"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/60 to-transparent transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <h2 className="font-headline text-4xl font-bold">委托申请</h2>
                    <p className="mt-2 opacity-90">{content?.commissionDescription || '为您量身定制。'}</p>
                  </div>
                </div>
              </Link>
            )}

            {loading ? <HomeCardSkeleton /> : (
              <Link href="/adoption" className="group w-full md:w-2/5">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={content?.adoptionImageUrl || "https://placehold.co/600x800.png"}
                    alt="设定领养"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/60 to-transparent transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <h2 className="font-headline text-4xl font-bold">设定领养</h2>
                    <p className="mt-2 opacity-90">{content?.adoptionDescription || '领养一个预先设计的角色。'}</p>
                  </div>
                </div>
              </Link>
            )}
        </div>
      </div>
      <div className="w-full mt-12 pb-8 text-center">
        <ContactInfo content={content} />
      </div>
    </div>
  );
}
