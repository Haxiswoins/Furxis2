'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import type { CharacterSeries, SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function SeriesCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-muted">
       <Skeleton className="w-full h-full" />
       <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/50 to-transparent">
           <Skeleton className="h-7 w-3/4" />
           <Skeleton className="h-4 w-1/2 mt-2" />
       </div>
    </div>
  );
}

export default function AdoptionSeriesPage() {
  const [series, setSeries] = useState<CharacterSeries[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [seriesData, content] = await Promise.all([
          getCharacterSeries(),
          getSiteContent(),
        ]);
        setSeries(seriesData);
        setSiteContent(content);
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">设定领养</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {loading ? <Skeleton className="h-6 w-72 mx-auto" /> : (siteContent?.adoptionPageDescription || '给这些预先设计的角色一个家。')}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <SeriesCardSkeleton key={i} />)
        ) : (
          series.map((s) => (
             <Link key={s.id} href={`/adoption/${encodeURIComponent(s.name)}`} className="group">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{objectFit: 'cover'}}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="font-headline text-2xl font-bold" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{s.name}</h3>
                  <p className="text-sm opacity-90 mt-1 line-clamp-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{s.description}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
