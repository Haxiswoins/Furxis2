
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveCharacterSeries } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { CharacterSeries } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: '系列名称至少需要2个字符。' }),
  description: z.string().min(10, { message: '系列描述至少需要10个字符。' }),
});

type FormValues = z.infer<typeof formSchema>;

type AdminCharacterSeriesFormProps = {
  series?: CharacterSeries;
};

export function AdminCharacterSeriesForm({ series }: AdminCharacterSeriesFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(series?.imageUrl || null);
  const [initialImagePreview, setInitialImagePreview] = useState<string | null>(series?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: series?.name || '',
      description: series?.description || '',
    },
  });

  async function handleSave(values: FormValues) {
    if (!series && !imageFile) {
        toast({ title: '图片缺失', description: '新增系列必须上传封面图片。', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      let imageUrl = initialImagePreview;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `series/${values.name}_${Date.now()}`);
      }

      if (!imageUrl) {
        throw new Error("图片上传失败或未提供。");
      }

      const seriesData: Omit<CharacterSeries, 'id'> = {
        name: values.name,
        description: values.description,
        imageUrl,
      };
      
      await saveCharacterSeries(seriesData, series?.id);
      
      toast({
        title: '保存成功！',
        description: `系列 "${values.name}" 已被成功保存。`,
      });
      router.push('/admin/character-series');
      router.refresh(); 
    } catch (error) {
       console.error("保存系列失败:", error);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>系列名称</FormLabel>
              <FormControl><Input placeholder="例如：赛博纪元" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>系列描述</FormLabel>
              <FormControl><Textarea placeholder="关于这个系列的详细背景和风格说明..." {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
            <FormLabel>封面图片</FormLabel>
            <div className="flex items-center gap-4">
                <div className="w-48 h-32 relative rounded-md border bg-muted flex-shrink-0">
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
            <FormDescription>这张图片将作为此系列的封面展示。</FormDescription>
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
