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
import { getCharacterSeries, deleteCharacterSeries } from '@/lib/data-service';
import type { CharacterSeries } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminCharacterSeriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [series, setSeries] = useState<CharacterSeries[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeries = async () => {
    setLoading(true);
    const seriesData = await getCharacterSeries();
    setSeries(seriesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeries();
  }, []);
  
  const handleDelete = async (id: string) => {
    try {
        await deleteCharacterSeries(id);
        toast({ title: '删除成功', description: '系列已从数据库中移除。' });
        fetchSeries(); // Refresh the list
    } catch (error) {
        toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold">设定系列管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">图片</TableHead>
              <TableHead>系列名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="text-right w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : series.length > 0 ? (
              series.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                     <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} style={{objectFit: 'cover'}} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/character-series/edit/${item.id}`)}>
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
                            此操作无法撤销。这将永久删除系列 "{item.name}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  没有找到任何系列。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <Button
        onClick={() => router.push('/admin/character-series/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增系列</span>
      </Button>
    </div>
  );
}
