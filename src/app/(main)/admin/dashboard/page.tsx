'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, ShoppingCart, ListOrdered, AlertTriangle } from 'lucide-react';
import { getCharacters, getCommissionOptions, getAllOrders } from '@/lib/data-service';
import type { Character, CommissionOption, Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
        </Card>
    )
}


export default function AdminDashboardPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [chars, options, allOrders] = await Promise.all([
                    getCharacters(),
                    getCommissionOptions(),
                    getAllOrders()
                ]);
                setCharacters(chars);
                setCommissionOptions(options);
                setOrders(allOrders);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const pendingOrders = orders.filter(o => o.status === '申请中' || o.status === '退养中').length;

    if (loading) {
        return (
             <div>
                <h1 className="text-3xl font-headline font-bold mb-6">仪表盘</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            </div>
        )
    }

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">领养角色总数</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{characters.length}</div>
            <p className="text-xs text-muted-foreground">当前在库的角色数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">委托选项总数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionOptions.length}</div>
            <p className="text-xs text-muted-foreground">当前可用的委托套餐</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">需要您处理的新订单</p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>欢迎回来, 管理员!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>您可以在左侧的导航栏中选择要管理的内容。请定期检查新的订单并更新它们的状态。</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
