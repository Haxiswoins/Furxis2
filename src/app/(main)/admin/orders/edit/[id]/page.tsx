
'use client';
import { AdminOrderForm } from '@/components/admin-order-form';
import { getOrderById } from '@/lib/data-service';
import type { Order } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditOrderPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getOrderById(id).then(ord => {
                setOrder(ord);
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

    if (!order) {
        return <div>未找到订单。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑订单：{order.orderNumber}</h1>
            <AdminOrderForm order={order} />
        </div>
    );
}
