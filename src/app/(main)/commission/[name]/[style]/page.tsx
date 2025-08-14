
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { chinaDivisions } from '@/lib/china-divisions';
import { useAuth } from '@/context/AuthContext';
import { getCommissionOptions, getCommissionStylesByOptionId, createCommissionApplication } from '@/lib/data-service';
import type { CommissionStyle, CommissionOption } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadImage } from '@/lib/upload-service';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function CommissionApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [commissionOption, setCommissionOption] = useState<CommissionOption | null>(null);
  const [commissionStyle, setCommissionStyle] = useState<CommissionStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commissionName = decodeURIComponent(params.name as string);
  const styleName = decodeURIComponent(params.style as string);

  useEffect(() => {
    if (!commissionName || !styleName) return;
    
    async function fetchData() {
        setLoading(true);
        try {
            const options = await getCommissionOptions();
            const currentOption = options.find(opt => opt.name === commissionName);

            if (currentOption) {
                setCommissionOption(currentOption);
                const styles = await getCommissionStylesByOptionId(currentOption.id);
                const currentStyle = styles.find(s => s.name === styleName);
                if (currentStyle) {
                    setCommissionStyle(currentStyle);
                } else {
                    notFound();
                }
            } else {
                notFound();
            }
        } catch (e) {
            notFound();
        } finally {
            setLoading(false);
        }
    }
    
    fetchData();
  }, [commissionName, styleName]);
  
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    const provinceData = chinaDivisions.find(p => p.name === province);
    const newCities = provinceData ? provinceData.cities.map(c => c.name) : [];
    setCities(newCities);
    setSelectedCity('');
    setDistricts([]);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const provinceData = chinaDivisions.find(p => p.name === selectedProvince);
    const cityData = provinceData?.cities.find(c => c.name === city);
    const newDistricts = cityData ? cityData.districts : [];
    setDistricts(newDistricts);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "图片太大",
          description: "请上传小于5MB的图片。",
          variant: "destructive",
        });
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
      }
      setReferenceImageFile(file);
      setReferenceImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setReferenceImageFile(null);
    setReferenceImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }
  
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !commissionStyle) return;

    setFormSubmitting(true);
    let referenceImageUrl: string | null = null;
    try {
      if (referenceImageFile) {
        referenceImageUrl = await uploadImage(referenceImageFile, `references/${user.uid}_${Date.now()}`);
      }

      const formData = new FormData(e.currentTarget);
      const applicationData = {
        userName: formData.get('name') as string,
        age: formData.get('age') as string,
        phone: formData.get('phone') as string,
        qq: formData.get('qq') as string,
        email: formData.get('email') as string,
        height: formData.get('height') as string,
        weight: formData.get('weight') as string,
        province: selectedProvince,
        city: selectedCity,
        district: formData.get('district') as string,
        addressDetail: formData.get('addressDetail') as string,
        referenceImageUrl: referenceImageUrl,
      };

      await createCommissionApplication(user.uid, commissionStyle, applicationData);
      toast({
        title: "申请已提交！",
        description: "我们的团队将审核您的信息并与您联系。",
      });
      router.push('/orders');
    } catch (error) {
      toast({
        title: "申请失败",
        description: "提交申请时发生错误，请稍后再试。",
        variant: "destructive",
      });
      setFormSubmitting(false);
    }
  };

  const renderLoginDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="w-full">申请估价</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>需要登录</AlertDialogTitle>
          <AlertDialogDescription>
            您需要登录后才能申请估价。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push(`/login?redirect=${pathname}`)}>
            登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderSubmitButton = () => (
    <Button size="lg" className="w-full" type="submit" disabled={formSubmitting}>
        {formSubmitting ? '提交中...' : '申请估价'}
    </Button>
  );

  if (loading || !commissionStyle || !commissionOption) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
           <CardHeader>
              <Skeleton className="h-9 w-1/2 mb-3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div className="space-y-1" key={i}>
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
           <CardFooter>
               <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
            <CardTitle className="text-3xl font-headline">{commissionOption.name} - {commissionStyle.name}</CardTitle>
            <CardDescription className="mt-2 text-base">{commissionStyle.description}</CardDescription>
        </CardHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 px-6 pb-6">
           <CardContent className="p-0 space-y-4">
            <div className="space-y-1">
              <Label>设定图</Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                  {referenceImagePreview ? (
                    <>
                      <Image src={referenceImagePreview} alt="设定图预览" fill style={{objectFit:'cover'}} className="rounded-md" />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6" onClick={clearImage}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Upload className="h-8 w-8"/>
                    </div>
                  )}
                </div>
                <Input 
                    id="referenceImage"
                    name="referenceImage"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    {referenceImagePreview ? '更换图片' : '选择图片'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1">上传一张角色的设定图，大小不超过5MB。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">您的姓名</Label>
                <Input id="name" name="name" placeholder="请输入您的姓名" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="age">年龄</Label>
                <Input id="age" name="age" type="number" placeholder="请输入您的年龄" required />
              </div>
               <div className="space-y-1">
                <Label htmlFor="phone">电话</Label>
                <Input id="phone" name="phone" placeholder="请输入您的电话" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qq">QQ</Label>
                <Input id="qq" name="qq" placeholder="请输入您的QQ号" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">邮箱地址</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" defaultValue={user?.email || ''} required />
              </div>
               <div className="space-y-1">
                <Label htmlFor="height">身高 (cm)</Label>
                <Input id="height" name="height" type="number" placeholder="例如：175" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight">体重 (kg)</Label>
                <Input id="weight" name="weight" type="number" placeholder="例如：60" required />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>地址</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select name="province" onValueChange={handleProvinceChange} required>
                  <SelectTrigger><SelectValue placeholder="选择省份" /></SelectTrigger>
                  <SelectContent>
                    {chinaDivisions.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select name="city" onValueChange={handleCityChange} value={selectedCity} disabled={cities.length === 0} required>
                  <SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select name="district" disabled={districts.length === 0} required>
                  <SelectTrigger><SelectValue placeholder="选择区/县" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="addressDetail">详细地址</Label>
                <Textarea id="addressDetail" name="addressDetail" placeholder="请输入街道、门牌号等详细信息" required />
            </div>
           </CardContent>

            <CardFooter className="p-0 pt-4">
               {isLoggedIn ? renderSubmitButton() : renderLoginDialog()}
            </CardFooter>
          </form>
      </Card>
    </div>
  );
}
