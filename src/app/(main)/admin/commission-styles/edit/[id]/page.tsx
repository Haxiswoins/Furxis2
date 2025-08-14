
'use client';

import { AdminCommissionStyleForm } from '@/components/admin-commission-style-form';
import { getCommissionStyleById } from '@/lib/data-service';
import type { CommissionStyle } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCommissionStylePage() {
    const params = useParams();
    const id = params.id as string;
    const [style, setStyle] = useState<CommissionStyle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getCommissionStyleById(id).then(item => {
                setStyle(item);
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

    if (!style) {
        return <div>未找到委托样式。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑委托样式：{style.name}</h1>
            <AdminCommissionStyleForm commissionStyle={style} />
        </div>
    );
}
