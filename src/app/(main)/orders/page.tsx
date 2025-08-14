
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getOrdersByUserId } from '@/lib/data-service';
import type { Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const lightStatusStyles: { [key: string]: string } = {
  '申请中': 'bg-blue-100 text-blue-800 border-blue-200',
  '待确认': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  '已确认': 'bg-teal-100 text-teal-800 border-teal-200',
  '排队中': 'bg-gray-100 text-gray-800 border-gray-200',
  '制作中': 'bg-purple-100 text-purple-800 border-purple-200',
  '取消中': 'bg-orange-100 text-orange-800 border-orange-200',
  '已发货': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '已完成': 'bg-green-100 text-green-800 border-green-200',
  '已取消': 'bg-red-100 text-red-800 border-red-200',
};

const darkStatusStyles: { [key: string]: string } = {
  '申请中': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '待确认': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '已确认': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '排队中': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  '制作中': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '取消中': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '已发货': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '已完成': 'bg-green-500/20 text-green-300 border-green-500/30',
  '已取消': 'bg-red-500/20 text-red-300 border-red-500/30',
};

function OrderRowSkeleton() {
  return (
    <div className="block border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-grow">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="self-start">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    getOrdersByUserId(user.uid)
      .then(fetchedOrders => {
        setOrders(fetchedOrders);
      })
      .finally(() => setLoading(false));
      
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <OrderRowSkeleton key={i} />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">我的订单</CardTitle>
          <CardDescription>在这里查看您的所有订单。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">您还没有任何订单。</p>
            ) : (
              orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} passHref>
                  <div className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={order.imageUrl}
                          alt={order.productName}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">{order.productName}</h3>
                        <p className="text-sm text-muted-foreground">订单号: {order.orderNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn("w-3 h-3 rounded-sm", order.orderType === '领养订单' ? 'bg-orange-400' : 'bg-blue-400')}></div>
                          <span className="text-sm">{order.orderType}</span>
                        </div>
                      </div>
                      <div className="self-start">
                          <Badge variant="outline" className={cn("text-xs", statusStyles[order.status as keyof typeof statusStyles])}>{order.status}</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
