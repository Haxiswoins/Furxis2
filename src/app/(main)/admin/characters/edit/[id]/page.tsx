
'use client';
import { AdminCharacterForm } from '@/components/admin-character-form';
import { getCharacterById } from '@/lib/data-service';
import type { Character } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCharacterPage() {
    const params = useParams();
    const id = params.id as string;
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getCharacterById(id).then(char => {
                setCharacter(char);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
             <div>
                <Skeleton className="h-9 w-1/4 mb-6" />
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-32" />
                </div>
            </div>
        )
    }

    if (!character) {
        return <div>未找到角色。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑角色：{character.name}</h1>
            <AdminCharacterForm character={character} />
        </div>
    );
}
