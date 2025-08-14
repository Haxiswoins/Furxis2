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
import { PlusCircle, Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCommissionOptions, deleteCommissionOption } from '@/lib/data-service';
import type { CommissionOption } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminCommissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissionOptions = async () => {
    setLoading(true);
    const options = await getCommissionOptions();
    setCommissionOptions(options);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommissionOptions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteCommissionOption(id);
      toast({ title: '删除成功', description: '委托选项已从数据库中移除。' });
      fetchCommissionOptions(); // Refresh the list
    } catch (error) {
      toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold">委托选项管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">图片</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>价格</TableHead>
              <TableHead className="text-right w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : commissionOptions.length > 0 ? (
              commissionOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image src={option.imageUrl} alt={option.name} width={64} height={64} style={{objectFit: 'cover'}} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{option.name}</TableCell>
                  <TableCell>{option.category}</TableCell>
                  <TableCell>{option.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/commissions/edit/${option.id}`)}>
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
                            此操作无法撤销。这将永久删除选项 "{option.name}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(option.id)}>确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  没有找到任何委托选项。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <Button
        onClick={() => router.push('/admin/commissions/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增选项</span>
      </Button>
    </div>
  );
}
