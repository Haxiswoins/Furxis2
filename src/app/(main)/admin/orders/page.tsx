
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAllOrders, deleteOrder } from '@/lib/data-service';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/context/ThemeContext';

const lightStatusStyles: { [key: string]: string } = {
  '申请中': 'text-blue-800',
  '待确认': 'text-cyan-800',
  '已确认': 'text-teal-800',
  '排队中': 'text-gray-800',
  '制作中': 'text-purple-800',
  '取消中': 'text-orange-800',
  '已发货': 'text-yellow-800',
  '已完成': 'text-green-800',
  '已取消': 'text-red-800',
};

const darkStatusStyles: { [key: string]: string } = {
  '申请中': 'text-blue-300',
  '待确认': 'text-cyan-300',
  '已确认': 'text-teal-300',
  '排队中': 'text-gray-300',
  '制作中': 'text-purple-300',
  '取消中': 'text-orange-300',
  '已发货': 'text-yellow-300',
  '已完成': 'text-green-300',
  '已取消': 'text-red-300',
};

function OrderRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
        </TableRow>
    )
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  const fetchOrders = async () => {
    setLoading(true);
    const allOrders = await getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const handleDelete = async (id: string) => {
    try {
        await deleteOrder(id);
        toast({ title: '删除成功', description: '订单已从数据库中移除。' });
        fetchOrders(); // Refresh the list
    } catch (error) {
        toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold">所有订单管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>总价</TableHead>
              <TableHead>下单日期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_,i) => <OrderRowSkeleton key={i} />)
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell className="font-medium">{order.productName}</TableCell>
                  <TableCell>{order.orderType}</TableCell>
                  <TableCell>
                      <Badge variant="outline" className={cn("text-xs bg-transparent border-none", statusStyles[order.status])}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/orders/edit/${order.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除订单 "{order.orderNumber}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(order.id)}>确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  没有找到任何订单。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
