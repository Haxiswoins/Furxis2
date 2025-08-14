
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { getOrderById, cancelOrder } from '@/lib/data-service';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CancelOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId || !user) return;
    getOrderById(orderId)
      .then(orderData => {
        if (orderData && orderData.userId === user.uid) {
          if (!['申请中', '待确认', '排队中'].includes(orderData.status)) {
             toast({
                title: "无法取消",
                description: "此订单当前状态无法取消。",
                variant: "destructive",
              });
             router.back();
             return;
          }
          setOrder(orderData);
        } else {
          notFound();
        }
      })
      .finally(() => setLoading(false));
  }, [orderId, user, router, toast]);


  if (loading || !order) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="h-9 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="flex justify-end gap-2">
                   <Skeleton className="h-10 w-24" />
                   <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "请填写原因",
        description: "取消订单需要您提供原因。",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await cancelOrder(orderId, reason);
      toast({
        title: "申请已提出",
        description: "您的取消申请已提交至管理员审核。",
      });
      router.push('/orders');
    } catch (error) {
       toast({
        title: "操作失败",
        description: "更新订单状态时出错，请稍后再试。",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">取消订单：{order.productName}</CardTitle>
          <CardDescription>我们很遗憾您决定取消。请告诉我们原因。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">取消原因</Label>
              <Textarea
                id="cancellation-reason"
                placeholder="例如：计划有变、找到了更合适的等..."
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                disabled={submitting}
              />
            </div>
            <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>返回</Button>
                 <Button type="submit" disabled={submitting}>
                   {submitting ? '提交中...' : '确认取消'}
                 </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
