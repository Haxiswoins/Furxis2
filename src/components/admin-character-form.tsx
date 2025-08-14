
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveCharacter, getCharacterSeries } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { Character, CharacterSeries } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  seriesId: z.string().min(1, '必须选择一个系列'),
  name: z.string().min(2, { message: '名称至少需要2个字符。' }),
  species: z.string().min(1, { message: '物种不能为空。' }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: '请输入有效的价格。' }),
  description: z.string().min(10, { message: '描述至少需要10个字符。' }),
  tags: z.string(),
  applicants: z.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

type AdminCharacterFormProps = {
  character?: Character;
};

type ImageState = {
    file: File | null;
    preview: string | null;
}

export function AdminCharacterForm({ character }: AdminCharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<CharacterSeries[]>([]);
  
  const [images, setImages] = useState<ImageState[]>([
      { file: null, preview: character?.imageUrl || null },
      { file: null, preview: character?.imageUrl1 || null },
      { file: null, preview: character?.imageUrl2 || null },
      { file: null, preview: character?.imageUrl3 || null },
      { file: null, preview: character?.imageUrl4 || null },
  ]);

  const [initialImagePreviews, setInitialImagePreviews] = useState<(string | null)[]>([
    character?.imageUrl || null,
    character?.imageUrl1 || null,
    character?.imageUrl2 || null,
    character?.imageUrl3 || null,
    character?.imageUrl4 || null,
  ]);

  useEffect(() => {
    getCharacterSeries().then(setSeries);
  }, []);

  const fileInputRefs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesId: character?.seriesId || '',
      name: character?.name || '',
      species: character?.species || '',
      price: character?.price || '',
      description: character?.description || '',
      tags: character?.tags.join(', ') || '',
      applicants: character?.applicants || 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const newImages = [...images];
        newImages[index] = {
            file: file,
            preview: URL.createObjectURL(file)
        };
        setImages(newImages);
    }
  };

  const handleSave = async (values: FormValues) => {
    if (!character && (!images[0].file || !images[1].file)) {
        toast({ title: '图片缺失', description: '新增角色必须上传至少前两张图片。', variant: 'destructive' });
        return;
    }
    
    setLoading(true);
    try {
      const imageUrls: (string | undefined)[] = await Promise.all(
          images.map(async (img, index) => {
              if (img.file) {
                  return await uploadImage(img.file, `characters/${values.name}_${index}_${Date.now()}`);
              }
              // If no new file, use the initial preview URL from when the component loaded
              return initialImagePreviews[index] || undefined;
          })
      );
      
      const characterData: Omit<Character, 'id'> = {
        seriesId: values.seriesId,
        name: values.name,
        species: values.species,
        price: values.price,
        description: values.description,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        applicants: values.applicants,
        imageUrl: imageUrls[0]!,
        imageUrl1: imageUrls[1]!,
        imageUrl2: imageUrls[2],
        imageUrl3: imageUrls[3],
        imageUrl4: imageUrls[4],
      };
      
      await saveCharacter(characterData, character?.id);
      
      toast({
        title: '保存成功！',
        description: `角色 "${values.name}" 已被成功保存。`,
      });
      router.push('/admin/characters');
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="seriesId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属系列</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个系列" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {series.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>该角色属于哪个主题系列？</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>名称</FormLabel> <FormControl><Input placeholder="例如：星尘" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="species" render={({ field }) => ( <FormItem> <FormLabel>物种</FormLabel> <FormControl><Input placeholder="例如：龙" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>价格 (元)</FormLabel> <FormControl><Input placeholder="例如：5000.00" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>描述</FormLabel> <FormControl><Textarea placeholder="角色的详细背景故事和设定..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>标签</FormLabel> <FormControl><Input placeholder="例如：可爱, 幻想, 蓝色" {...field} /></FormControl> <FormDescription>使用逗号分隔不同的标签。</FormDescription> <FormMessage /> </FormItem> )}/>
        
        {images.map((img, index) => (
             <div key={index} className="space-y-2 p-4 border rounded-md">
                <FormLabel>图片 {index + 1} {index === 0 && "(主图)"} {index >= 1 && `(详情图 ${index})`}</FormLabel>
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                        {img.preview && (
                            <Image src={img.preview} alt={`图片 ${index+1} 预览`} fill style={{objectFit:'cover'}} className="rounded-md" />
                        )}
                    </div>
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, index)}
                        className="hidden"
                        ref={fileInputRefs[index]}
                        id={`file-input-${index}`}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRefs[index].current?.click()}>
                        <Upload className="mr-2" />
                        {img.preview ? '更换图片' : '选择图片'}
                    </Button>
                </div>
            </div>
        ))}
        
         <FormField
          control={form.control}
          name="applicants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>申请人数</FormLabel>
              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
              <FormDescription>初始申请人数。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
