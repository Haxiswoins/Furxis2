'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import type { CommissionOption, SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

function CommissionCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/3 mb-3" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-5/6 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}

const lightStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-green-100 text-green-800 border-green-200',
  '已结束': 'bg-zinc-100 text-zinc-800 border-zinc-200',
  '即将开放': 'bg-blue-100 text-blue-800 border-blue-200',
};

const darkStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-green-500/20 text-green-300 border-green-500/30',
  '已结束': 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  '即将开放': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function CommissionPage() {
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [options, content] = await Promise.all([
          getCommissionOptions(),
          getSiteContent(),
        ]);
        
        const sortedOptions = options.sort((a, b) => {
          const timeA = parseInt(a.id.split('_')[1] || '0');
          const timeB = parseInt(b.id.split('_')[1] || '0');
          return timeB - timeA;
        });

        setCommissionOptions(sortedOptions);
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
        <h1 className="text-4xl font-headline font-bold">委托申请</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {loading ? <Skeleton className="h-6 w-80 mx-auto" /> : (siteContent?.commissionPageDescription || '选择一个基础套餐开始您的定制兽装之旅。')}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => <CommissionCardSkeleton key={i} />)
        ) : (
          commissionOptions.map((item) => (
             <Link key={item.id} href={`/commission/${encodeURIComponent(item.name)}`} className="group block relative aspect-[3/5] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{objectFit: 'cover'}}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="text-center space-y-2">
                    <h3 className="font-headline text-2xl font-bold" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{item.name}</h3>
                    <p className="text-sm opacity-90" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{item.category}</p>
                    <p className="text-xs opacity-80 mt-2 line-clamp-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{item.description}</p>
                  </div>
                  <div className="absolute bottom-6 flex flex-col items-center gap-3">
                     <Badge variant="outline" className={cn("text-xs font-semibold backdrop-blur-sm", statusStyles[item.status])}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
