
'use client';

import { AdminCommissionForm } from '@/components/admin-commission-form';
import { getCommissionOptionById } from '@/lib/data-service';
import type { CommissionOption } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCommissionPage() {
    const params = useParams();
    const id = params.id as string;
    const [commission, setCommission] = useState<CommissionOption | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getCommissionOptionById(id).then(option => {
                setCommission(option);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
             <div>
                <Skeleton className="h-9 w-1/4 mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
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

    if (!commission) {
        return <div>未找到委托选项。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑委托选项：{commission.name}</h1>
            <AdminCommissionForm commissionOption={commission} />
        </div>
    );
}
