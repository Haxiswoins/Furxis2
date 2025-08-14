
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateOrder } from '@/lib/data-service';
import { chinaDivisions } from '@/lib/china-divisions';
import type { Order } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  total: z.string().min(1, { message: '总价不能为空。' }),
  status: z.enum(['申请中', '待确认', '排队中', '制作中', '取消中', '已发货', '已完成', '已取消']),
  shippingTrackingId: z.string().optional(),
  // Application Data
  userName: z.string().min(1, '姓名不能为空'),
  age: z.string().min(1, '年龄不能为空'),
  phone: z.string().min(1, '电话不能为空'),
  qq: z.string(),
  email: z.string().email('请输入有效的邮箱'),
  height: z.string().min(1, '身高不能为空'),
  weight: z.string().min(1, '体重不能为空'),
  // Address
  province: z.string().min(1, '省份不能为空'),
  city: z.string().min(1, '城市不能为空'),
  district: z.string().min(1, '区域不能为空'),
  addressDetail: z.string().min(1, '详细地址不能为空'),
});

type AdminOrderFormProps = {
  order: Order;
};

export function AdminOrderForm({ order }: AdminOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [selectedProvince, setSelectedProvince] = useState(order.applicationData?.province || '');
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total: order?.total || '',
      status: order?.status || '申请中',
      shippingTrackingId: order?.shippingTrackingId || '',
      userName: order?.applicationData?.userName || '',
      age: order?.applicationData?.age || '',
      phone: order?.applicationData?.phone || '',
      qq: order?.applicationData?.qq || '',
      email: order?.applicationData?.email || '',
      height: order?.applicationData?.height || '',
      weight: order?.applicationData?.weight || '',
      province: order?.applicationData?.province || '',
      city: order?.applicationData?.city || '',
      district: order?.applicationData?.district || '',
      addressDetail: order?.applicationData?.addressDetail || '',
    },
  });

  useEffect(() => {
    if (selectedProvince) {
      const provinceData = chinaDivisions.find(p => p.name === selectedProvince);
      setCities(provinceData?.cities.map(c => c.name) || []);
    }
  }, [selectedProvince]);

  useEffect(() => {
    const cityValue = form.getValues('city');
    if (selectedProvince && cityValue) {
        const provinceData = chinaDivisions.find(p => p.name === selectedProvince);
        const cityData = provinceData?.cities.find(c => c.name === cityValue);
        setDistricts(cityData?.districts || []);
    }
  }, [selectedProvince, form]);
  
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    form.setValue('province', province);
    form.setValue('city', '');
    form.setValue('district', '');
    setCities(chinaDivisions.find(p => p.name === province)?.cities.map(c => c.name) || []);
    setDistricts([]);
  };

  const handleCityChange = (city: string) => {
    form.setValue('city', city);
    form.setValue('district', '');
    const provinceData = chinaDivisions.find(p => p.name === form.getValues('province'));
    const cityData = provinceData?.cities.find(c => c.name === city);
    setDistricts(cityData?.districts || []);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const updatedData: Partial<Order> = {
        total: values.total,
        status: values.status,
        shippingTrackingId: values.shippingTrackingId || null,
        shippingAddress: `${values.province} ${values.city} ${values.district} ${values.addressDetail}`,
        applicationData: {
            ...order.applicationData,
            userName: values.userName,
            age: values.age,
            phone: values.phone,
            qq: values.qq,
            email: values.email,
            height: values.height,
            weight: values.weight,
            province: values.province,
            city: values.city,
            district: values.district,
            addressDetail: values.addressDetail,
        }
      };
      
      await updateOrder(order.id, updatedData);
      
      toast({
        title: '保存成功！',
        description: `订单 "${order.orderNumber}" 已被成功更新。`,
      });
      router.push('/admin/orders');
      router.refresh();
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
  }

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>订单设置</CardTitle>
                        <CardDescription>修改订单的状态、价格和物流信息。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="total"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>总价</FormLabel>
                                <FormControl><Input placeholder="例如：5200.00" {...field} /></FormControl>
                                <FormDescription>最终确定的订单价格。如果是估价，请保留文字说明。</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>订单状态</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择一个状态" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="申请中">申请中</SelectItem>
                                        <SelectItem value="待确认">待确认</SelectItem>
                                        <SelectItem value="排队中">排队中</SelectItem>
                                        <SelectItem value="制作中">制作中</SelectItem>
                                        <SelectItem value="取消中">取消中</SelectItem>
                                        <SelectItem value="已发货">已发货</SelectItem>
                                        <SelectItem value="已完成">已完成</SelectItem>
                                        <SelectItem value="已取消">已取消</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shippingTrackingId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>物流单号</FormLabel>
                                <FormControl><Input placeholder="例如：SF123456789" {...field} /></FormControl>
                                <FormDescription>如果订单已发货，请填写此项。</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         {order.cancellationReason && (
                            <Card className="bg-destructive/10 border-destructive/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">取消理由</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-destructive/90">{order.cancellationReason}</p>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
        
                <Card>
                    <CardHeader>
                        <CardTitle>用户信息</CardTitle>
                        <CardDescription>查看和修改用户的申请资料。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="userName" render={({ field }) => ( <FormItem><FormLabel>姓名</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>年龄</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>电话</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="qq" render={({ field }) => ( <FormItem><FormLabel>QQ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>邮箱</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>身高 (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>体重 (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div>
                                <p className="text-sm font-medium mb-2">用户ID</p>
                                <p className="text-xs text-muted-foreground break-all">{order.userId}</p>
                            </div>
                       </div>
                        {order.applicationData?.referenceImageUrl && (
                            <div className="space-y-2 pt-4">
                                <p className="font-semibold">用户设定图</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative w-48 h-48 rounded-md overflow-hidden cursor-pointer border">
                                            <Image src={order.applicationData.referenceImageUrl} alt="用户设定图" fill style={{ objectFit: 'cover'}} />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                                        <div className="relative aspect-video w-full h-full">
                                            <Image src={order.applicationData.referenceImageUrl} alt="用户设定图" fill style={{ objectFit: 'contain' }} />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>地址信息</CardTitle>
                        <CardDescription>修改用户的收货地址。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="province" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>省份</FormLabel>
                                    <Select onValueChange={handleProvinceChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="选择省份" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {chinaDivisions.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>城市</FormLabel>
                                    <Select onValueChange={handleCityChange} value={field.value} disabled={cities.length === 0}>
                                         <FormControl>
                                            <SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                              <FormField control={form.control} name="district" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>区/县</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={districts.length === 0}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="选择区/县" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                        </div>
                         <FormField control={form.control} name="addressDetail" render={({ field }) => ( <FormItem><FormLabel>详细地址</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={loading} size="lg">
                    {loading ? '保存中...' : '保存订单'}
                  </Button>
                   <Button type="button" variant="outline" onClick={() => router.back()} size="lg">
                    返回
                  </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
