
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PawPrint, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { getCharacterByName } from '@/lib/data-service';
import type { Character } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';

export default function AdoptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  const characterName = decodeURIComponent(params.characterName as string);
  const seriesName = decodeURIComponent(params.name as string);

  useEffect(() => {
    if (!characterName) return;
    getCharacterByName(characterName)
      .then(char => {
        if (char) {
          setCharacter(char);
        } else {
          notFound();
        }
      })
      .finally(() => setLoading(false));
  }, [characterName]);

  const characterImages = character
    ? [character.imageUrl, character.imageUrl1, character.imageUrl2, character.imageUrl3, character.imageUrl4].filter(Boolean) as string[]
    : [];

  if (loading || !character) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-7 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-12 w-full mt-4" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-square" />
                  <Skeleton className="w-full aspect-square" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleApplyClick = () => {
    router.push(`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(characterName)}/apply`);
  };
  
  const renderLoginDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
          <Button size="lg" className="w-full">
            <PawPrint className="mr-2" />
            申请领养
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>需要登录</AlertDialogTitle>
          <AlertDialogDescription>
            您需要登录后才能申请领养。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push(`/login?redirect=${pathname}`)}>
            登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Details Column */}
            <div className="sticky top-24">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-4xl font-headline">{character.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-1">{character.species}</CardDescription>
              </CardHeader>
              <p className="text-foreground/90 mb-4">{character.description}</p>
              <div className="text-sm text-muted-foreground mb-6">
                <span className="font-semibold">{character.applicants}</span> 人已申请
              </div>
              <CardFooter className="p-0">
                {isLoggedIn ? (
                  <Button size="lg" className="w-full" onClick={handleApplyClick}>
                      <PawPrint className="mr-2" />
                      申请领养
                  </Button>
                ) : (
                  renderLoginDialog()
                )}
              </CardFooter>
            </div>

            {/* Image Column */}
            <div className="max-h-[80vh] overflow-y-auto space-y-4 pr-2">
              {characterImages.map((imgSrc, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                      <Image
                        src={imgSrc}
                        alt={`${character.name} - 视图 ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 90vw, 45vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                     <DialogClose className="absolute -top-2 -right-2 z-50 bg-background/50 rounded-full p-1 text-foreground">
                        <X className="h-5 w-5" />
                     </DialogClose>
                     <div className="relative aspect-video w-full h-full">
                        <Image src={imgSrc} alt={`${character.name} - 视图 ${index + 1}`} fill style={{ objectFit: 'contain' }} />
                     </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
