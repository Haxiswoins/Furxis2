'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getSiteContent, saveSiteContent } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { SiteContent } from '@/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';

const formSchema = z.object({
  commissionTitle: z.string(),
  commissionDescription: z.string(),
  adoptionTitle: z.string(),
  adoptionDescription: z.string(),
  adoptionPageDescription: z.string(),
  commissionPageDescription: z.string(),
  adminEmail: z.string().email({ message: "请输入有效的邮箱地址。" }).min(1, '管理员邮箱不能为空'),
  sunriseHour: z.coerce.number().min(0, "小时不能小于0").max(23, "小时不能大于23"),
  sunsetHour: z.coerce.number().min(0, "小时不能小于0").max(23, "小时不能大于23"),
  contactInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;


function SiteContentFormSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-10 w-full mt-2" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-10 w-full mt-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Skeleton className="h-12 w-32" />
        </div>
    )
}


export default function SiteContentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const [commissionImageFile, setCommissionImageFile] = useState<File | null>(null);
    const [adoptionImageFile, setAdoptionImageFile] = useState<File | null>(null);
    const [homeBgImageFile, setHomeBgImageFile] = useState<File | null>(null);

    const [commissionImagePreview, setCommissionImagePreview] = useState<string | null>(null);
    const [adoptionImagePreview, setAdoptionImagePreview] = useState<string | null>(null);
    const [homeBgImagePreview, setHomeBgImagePreview] = useState<string | null>(null);

    const commissionFileInputRef = useRef<HTMLInputElement>(null);
    const adoptionFileInputRef = useRef<HTMLInputElement>(null);
    const homeBgFileInputRef = useRef<HTMLInputElement>(null);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: async () => {
             const loadedContent = await getSiteContent();
             return {
                commissionTitle: loadedContent?.commissionTitle || '',
                commissionDescription: loadedContent?.commissionDescription || '',
                adoptionTitle: loadedContent?.adoptionTitle || '',
                adoptionDescription: loadedContent?.adoptionDescription || '',
                adoptionPageDescription: loadedContent?.adoptionPageDescription || '',
                commissionPageDescription: loadedContent?.commissionPageDescription || '',
                adminEmail: loadedContent?.adminEmail || '',
                sunriseHour: loadedContent?.sunriseHour ?? 6,
                sunsetHour: loadedContent?.sunsetHour ?? 18,
                contactInfo: loadedContent?.contactInfo || '',
            }
        },
    });

    useEffect(() => {
        async function loadContent() {
            setInitialLoading(true);
            const loadedContent = await getSiteContent();
            if (loadedContent) {
                form.reset({
                  commissionTitle: loadedContent.commissionTitle,
                  commissionDescription: loadedContent.commissionDescription,
                  adoptionTitle: loadedContent.adoptionTitle,
                  adoptionDescription: loadedContent.adoptionDescription,
                  adoptionPageDescription: loadedContent.adoptionPageDescription,
                  commissionPageDescription: loadedContent.commissionPageDescription,
                  adminEmail: loadedContent.adminEmail,
                  sunriseHour: loadedContent.sunriseHour ?? 6,
                  sunsetHour: loadedContent.sunsetHour ?? 18,
                  contactInfo: loadedContent.contactInfo || '',
                });
                setCommissionImagePreview(loadedContent.commissionImageUrl);
                setAdoptionImagePreview(loadedContent.adoptionImageUrl);
                setHomeBgImagePreview(loadedContent.homeBackgroundImageUrl || null);
            }
            setInitialLoading(false);
        }
        loadContent();
    }, [form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImageFile: Function, setPreview: Function) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (values: FormValues) => {
        setLoading(true);
        try {
            const currentContent = await getSiteContent();
            
            let newCommissionImageUrl = commissionImagePreview;
            let newAdoptionImageUrl = adoptionImagePreview;
            let newHomeBgImageUrl = homeBgImagePreview;
            
            if (commissionImageFile) {
                newCommissionImageUrl = await uploadImage(commissionImageFile, `site/commission_home_${Date.now()}`);
            }

            if (adoptionImageFile) {
                newAdoptionImageUrl = await uploadImage(adoptionImageFile, `site/adoption_home_${Date.now()}`);
            }

            if (homeBgImageFile) {
                 newHomeBgImageUrl = await uploadImage(homeBgImageFile, `site/home_bg_${Date.now()}`);
            }

            const updatedContent: SiteContent = {
                ...currentContent, // Start with current content to preserve all fields
                ...values,
                commissionImageUrl: newCommissionImageUrl || "",
                adoptionImageUrl: newAdoptionImageUrl || "",
                homeBackgroundImageUrl: newHomeBgImageUrl || null,
            };
            
            await saveSiteContent(updatedContent);

            toast({
                title: '保存成功！',
                description: '网站内容已更新。页面即将刷新...',
            });
            
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
    };


    if (initialLoading) {
        return (
            <div>
                 <h1 className="text-3xl font-headline font-bold mb-6">网站内容管理</h1>
                 <SiteContentFormSkeleton />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">网站内容管理</h1>
            <p className="text-muted-foreground mb-8">在这里修改网站的全局内容，例如首页的卡片信息和列表页的描述。</p>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                     <Card>
                        <CardHeader>
                           <CardTitle>全局设置</CardTitle>
                           <CardDescription>配置网站的核心参数和全局视觉元素。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="adminEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>管理员邮箱</FormLabel>
                                        <FormControl><Input {...field} placeholder="admin@example.com" /></FormControl>
                                        <FormDescription>用于接收新订单和系统通知的邮箱地址。</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="sunriseHour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>日出时间（小时）</FormLabel>
                                            <FormControl><Input type="number" min="0" max="23" {...field} /></FormControl>
                                            <FormDescription>网站切换到浅色主题的时间 (0-23)。</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sunsetHour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>日落时间（小时）</FormLabel>
                                            <FormControl><Input type="number" min="0" max="23" {...field} /></FormControl>
                                            <FormDescription>网站切换到深色主题的时间 (0-23)。</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="contactInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>“联系我们”弹窗内容</FormLabel>
                                        <FormControl><Textarea {...field} placeholder="例如：邮箱号（xxx@xxx.com），QQ号（123456）" rows={3} /></FormControl>
                                        <FormDescription>这段文字将显示在“联系我们”的弹窗中。</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <FormLabel>首页背景图</FormLabel>
                                <div className="flex items-center gap-4">
                                    {homeBgImagePreview && (
                                        <div className="w-48 h-32 relative rounded-md border bg-muted flex-shrink-0">
                                            <Image src={homeBgImagePreview} alt="首页背景预览" fill style={{objectFit:'cover'}} className="rounded-md"/>
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6" onClick={() => {
                                                setHomeBgImageFile(null);
                                                setHomeBgImagePreview(null);
                                            }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <Input
                                        id="homeBgImageFile"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setHomeBgImageFile, setHomeBgImagePreview)}
                                        ref={homeBgFileInputRef}
                                        className="hidden"
                                    />
                                    <Button type="button" variant="outline" onClick={() => homeBgFileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {homeBgImagePreview ? '更换图片' : '选择图片'}
                                    </Button>
                                </div>
                                <FormDescription>这张图片将作为/home页面的全屏背景。如果留空，则不显示背景图。</FormDescription>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                               <CardTitle>委托申请区</CardTitle>
                               <CardDescription>修改“委托申请”相关的内容。</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="commissionTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>首页卡片标题</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="commissionDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>首页卡片描述</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="commissionPageDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>委托列表页描述</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <FormLabel>首页卡片背景图</FormLabel>
                                     <div className="flex items-center gap-4">
                                        {commissionImagePreview && (
                                            <div className="w-32 h-48 relative rounded-md border bg-muted flex-shrink-0">
                                                <Image src={commissionImagePreview} alt="委托卡片预览" fill style={{objectFit:'cover'}} className="rounded-md"/>
                                            </div>
                                        )}
                                        <Input
                                            id="commissionImageFile"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, setCommissionImageFile, setCommissionImagePreview)}
                                            ref={commissionFileInputRef}
                                            className="hidden"
                                        />
                                        <Button type="button" variant="outline" onClick={() => commissionFileInputRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {commissionImagePreview ? '更换图片' : '选择图片'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                               <CardTitle>设定领养区</CardTitle>
                               <CardDescription>修改“设定领养”相关的内容。</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="adoptionTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>首页卡片标题</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adoptionDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>首页卡片描述</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="adoptionPageDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>领养列表页描述</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <div className="space-y-2">
                                    <FormLabel>首页卡片背景图</FormLabel>
                                    <div className="flex items-center gap-4">
                                        {adoptionImagePreview && (
                                            <div className="w-32 h-48 relative rounded-md border bg-muted flex-shrink-0">
                                                <Image src={adoptionImagePreview} alt="领养卡片预览" fill style={{objectFit:'cover'}} className="rounded-md" />
                                            </div>
                                        )}
                                        <Input
                                            id="adoptionImageFile"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, setAdoptionImageFile, setAdoptionImagePreview)}
                                            ref={adoptionFileInputRef}
                                            className="hidden"
                                        />
                                         <Button type="button" variant="outline" onClick={() => adoptionFileInputRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {adoptionImagePreview ? '更换图片' : '选择图片'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

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
