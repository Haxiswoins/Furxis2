
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getContracts, saveContracts } from '@/lib/data-service';
import type { Contracts } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  commissionContract: z.string().min(1, '委托合同内容不能为空'),
  adoptionContract: z.string().min(1, '领养合同内容不能为空'),
  commissionConfirmationEmail: z.string().min(1, '邮件模板不能为空').refine(
      (val) => val.includes('{productName}'),
      { message: '邮件模板必须包含 {productName} 占位符' }
  ),
});

type FormValues = z.infer<typeof formSchema>;


function ContractsFormSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-12 w-32" />
        </div>
    )
}


export default function ContractsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: async () => {
             const loadedContracts = await getContracts();
             return {
                commissionContract: loadedContracts?.commissionContract || '',
                adoptionContract: loadedContracts?.adoptionContract || '',
                commissionConfirmationEmail: loadedContracts?.commissionConfirmationEmail || '',
            }
        },
    });

    useEffect(() => {
        async function loadContent() {
            setInitialLoading(true);
            const loadedContracts = await getContracts();
            if (loadedContracts) {
                form.reset(loadedContracts);
            }
            setInitialLoading(false);
        }
        loadContent();
    }, [form]);


    const handleSave = async (values: FormValues) => {
        setLoading(true);
        try {
            await saveContracts(values);
            toast({
                title: '保存成功！',
                description: '合同与邮件模板已更新。',
            });
        } catch (error) {
            console.error("保存失败:", error);
            toast({
                title: '保存失败',
                description: error instanceof Error ? error.message : '发生未知错误，请稍后重试。',
                variant: 'destructive',
            });
        } finally {
             setLoading(false);
        }
    };


    if (initialLoading) {
        return (
            <div>
                 <h1 className="text-3xl font-headline font-bold mb-6">合同与邮件管理</h1>
                 <ContractsFormSkeleton />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">合同与邮件管理</h1>
            <p className="text-muted-foreground mb-8">在这里修改用户需要同意的合同条款，以及系统自动发送的邮件模板。</p>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                     <Card>
                        <CardHeader>
                           <CardTitle>委托合同</CardTitle>
                           <CardDescription>当用户确认委托订单时，需要阅读并同意此合同。</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="commissionContract"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea {...field} rows={15} placeholder="请在此处输入您的委托合同条款..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle>领养合同</CardTitle>
                           <CardDescription>当用户提交领养申请时，需要阅读并同意此合同。 (此功能关联领养申请页面的条款弹窗)</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="adoptionContract"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea {...field} rows={15} placeholder="请在此处输入您的领养合同条款..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                           <CardTitle>委托中标邮件模板</CardTitle>
                           <CardDescription>当您将委托订单状态改为“待确认”时，系统将自动向用户发送此邮件。</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="commissionConfirmationEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea {...field} rows={5} /></FormControl>
                                        <FormDescription>{'模板中的 `{productName}` 部分将被自动替换为实际的产品名称，请务必保留。'}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? '保存中...' : '保存所有更改'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
