
'use client';

import { AdminCharacterSeriesForm } from '@/components/admin-character-series-form';
import { getCharacterSeriesById } from '@/lib/data-service';
import type { CharacterSeries } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCharacterSeriesPage() {
    const params = useParams();
    const id = params.id as string;
    const [series, setSeries] = useState<CharacterSeries | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getCharacterSeriesById(id).then(item => {
                setSeries(item);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
             <div>
                <Skeleton className="h-9 w-1/4 mb-6" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
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

    if (!series) {
        return <div>未找到该系列。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑系列：{series.name}</h1>
            <AdminCharacterSeriesForm series={series} />
        </div>
    );
}
