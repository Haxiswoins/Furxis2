'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import type { Character, CharacterSeries } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, notFound } from 'next/navigation';

function CharacterCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col text-sm">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-muted/50 flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
}

export default function AdoptionCharacterListPage() {
  const params = useParams();
  const seriesName = decodeURIComponent(params.name as string);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [series, setSeries] = useState<CharacterSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!seriesName) return;

      try {
        setLoading(true);
        const seriesData = await getCharacterSeriesByName(seriesName);
        if (seriesData) {
          setSeries(seriesData);
          const chars = await getCharactersBySeriesId(seriesData.id);
          setCharacters(chars);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [seriesName]);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">{loading ? <Skeleton className="h-10 w-64 mx-auto" /> : series?.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {loading ? <Skeleton className="h-6 w-80 mx-auto" /> : (series?.description || '给这些预先设计的角色一个家。')}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          [...Array(10)].map((_, i) => <CharacterCardSkeleton key={i} />)
        ) : characters.length > 0 ? (
          characters.map((char) => (
            <Card key={char.name} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col text-sm">
              <CardHeader className="p-0">
                <div className="relative aspect-[3/4]">
                    <Image
                      src={char.imageUrl}
                      alt={char.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      style={{objectFit: 'cover'}}
                    />
                </div>
              </CardHeader>
              <CardContent className="p-3 flex-grow">
                <CardTitle className="text-lg font-headline mb-1 truncate">{char.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-2">{char.species}</CardDescription>
                <p className="text-foreground/80 mb-3 text-xs line-clamp-2">{char.description}</p>
                <div className="flex flex-wrap gap-1">
                  {char.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                </div>
              </CardContent>
              <CardFooter className="p-3 bg-muted/50 flex justify-between items-center">
                <p className="text-base font-bold text-primary">{char.price}</p>
                <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                  <Button size="sm">
                    <Heart className="mr-1 h-3 w-3" /> 领养
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">该系列下暂无角色。</p>
          </div>
        )}
      </div>
    </div>
  );
}
