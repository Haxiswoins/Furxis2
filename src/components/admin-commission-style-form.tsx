
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCommissionOptions, saveCommissionStyle } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { CommissionStyle, CommissionOption } from '@/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  commissionOptionId: z.string().min(1, '必须选择一个所属委托'),
  name: z.string().min(2, { message: '名称至少需要2个字符。' }),
  price: z.string().min(1, { message: '价格描述不能为空。' }),
  description: z.string().min(10, { message: '描述至少需要10个字符。' }),
  tags: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type AdminCommissionStyleFormProps = {
  commissionStyle?: CommissionStyle;
};

export function AdminCommissionStyleForm({ commissionStyle }: AdminCommissionStyleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(commissionStyle?.imageUrl || null);
  const [initialImagePreview, setInitialImagePreview] = useState<string | null>(commissionStyle?.imageUrl || null);
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCommissionOptions().then(setCommissionOptions);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commissionOptionId: commissionStyle?.commissionOptionId || '',
      name: commissionStyle?.name || '',
      price: commissionStyle?.price || '',
      description: commissionStyle?.description || '',
      tags: commissionStyle?.tags.join(', ') || '',
    },
  });

  async function handleSave(values: FormValues) {
    if (!commissionStyle && !imageFile) {
        toast({ title: '图片缺失', description: '新增委托样式必须上传图片。', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      let imageUrl = initialImagePreview;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `commission-styles/${values.name}_${Date.now()}`);
      }

      if (!imageUrl) {
        throw new Error("图片上传失败或未提供。");
      }

      const styleData: Omit<CommissionStyle, 'id'> = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl,
      };
      
      await saveCommissionStyle(styleData, commissionStyle?.id);
      
      toast({
        title: '保存成功！',
        description: `委托样式 "${values.name}" 已被成功保存。`,
      });
      router.push('/admin/commission-styles');
      router.refresh(); 
    } catch (error) {
       console.error("保存委托样式失败:", error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生未知错误，请检查控制台获取更多信息。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField
            control={form.control}
            name="commissionOptionId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>所属委托</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="选择一个所属的委托类型" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {commissionOptions.map(option => (
                             <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormDescription>此样式属于哪个大的委托类别？</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>样式名称</FormLabel> <FormControl><Input placeholder="例如：标准全身" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>价格描述</FormLabel> <FormControl><Input placeholder="例如：￥15000 起" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>描述</FormLabel> <FormControl><Textarea placeholder="关于这个样式的详细说明..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>标签</FormLabel> <FormControl><Input placeholder="例如：标准, 全包" {...field} /></FormControl> <FormDescription>使用逗号分隔不同的标签。</FormDescription> <FormMessage /> </FormItem> )}/>
        
        <div className="space-y-2">
            <FormLabel>图片</FormLabel>
            <div className="flex items-center gap-4">
                <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                    {imagePreview && (
                        <Image src={imagePreview} alt="图片预览" fill style={{objectFit:'cover'}} className="rounded-md" />
                    )}
                </div>
                <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                        }
                    }}
                />
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    {imagePreview ? '更换图片' : '选择图片'}
                </Button>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存更改'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </form>
    </Form>
  );
}

    
