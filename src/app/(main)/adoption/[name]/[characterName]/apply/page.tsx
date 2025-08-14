
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chinaDivisions } from '@/lib/china-divisions';
import { useAuth } from '@/context/AuthContext';
import { getCharacterByName, createAdoptionApplication } from '@/lib/data-service';
import type { Character } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function AdoptionApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const characterName = decodeURIComponent(params.characterName as string);

  useEffect(() => {
    if (!characterName) return;
    getCharacterByName(characterName)
      .then(char => {
        if (char) {
          setCharacter(char);
        } else {
          notFound();
        }
      })
      .finally(() => setLoading(false));
  }, [characterName]);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    const provinceData = chinaDivisions.find(p => p.name === province);
    const newCities = provinceData?.cities.map(c => c.name) || [];
    setCities(newCities);
    setSelectedCity('');
    setDistricts([]);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const provinceData = chinaDivisions.find(p => p.name === selectedProvince);
    const cityData = provinceData?.cities.find(c => c.name === city);
    const newDistricts = cityData?.districts || [];
    setDistricts(newDistricts);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !character) return;

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
    };

    try {
      setLoading(true);
      await createAdoptionApplication(user.uid, character, applicationData);
      toast({
        title: "恭喜您！申请已提交",
        description: `管理员将在三个工作日内联系您。`,
      });
      router.push('/orders');
    } catch (error) {
      toast({
        title: "申请失败",
        description: "提交申请时发生错误，请稍后再试。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || !character) {
     return (
        <div className="max-w-4xl mx-auto py-8">
            <Card>
                <CardHeader className="text-center">
                    <Skeleton className="h-9 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[...Array(7)].map((_, i) => (
                           <div className="space-y-2" key={i}>
                               <Skeleton className="h-4 w-1/4" />
                               <Skeleton className="h-10 w-full" />
                           </div>
                       ))}
                   </div>
                   <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                   </div>
                   <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                   </div>
                   <div className="text-center pt-4">
                       <Skeleton className="h-12 w-48 mx-auto" />
                   </div>
                </CardContent>
            </Card>
        </div>
     );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">领养申请：{characterName}</CardTitle>
          <CardDescription>请填写您的信息以完成申请。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required />
                <Dialog>
                  <DialogTrigger asChild>
                     <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                       我已阅读并同意 <span className="text-primary hover:underline cursor-pointer">领养条款和条件</span>
                    </label>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">前行无界工作室兽装领养条款与条件</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-6">
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p className="font-semibold">发布日期：[2025年8月1日]</p>
                            <p className="font-bold">欢迎您！</p>
                            <p>感谢您关注并选择前行无界工作室（以下简称“我们”或“工作室”）的原创兽装设定。在您提交领养申请前，请务必仔细阅读、充分理解并同意以下全部条款与条件。</p>
                            <p>当您勾选“我已阅读并同意”或进行任何下一步操作时，即表示您已与我们达成协议，自愿接受本条款与条件的约束。若您不同意任何内容，请立即停止申请流程。</p>
                            
                            <h3 className="font-bold text-base text-foreground">1. 定义</h3>
                            <p><strong>设定（Design）：</strong> 指由我们原创设计并拥有完整知识产权的兽装角色形象。</p>
                            <p><strong>领养（Adoption）：</strong> 指您向我们支付相应对价，委托我们将特定“设定”制作成实体兽装并获得该实体兽装所有权及有限使用权的行为。</p>
                            <p><strong>定金（Deposit）：</strong> 指您为担保领养协议履行而预先支付的款项，根据《中华人民共和国民法典》的规定，此款项具有定金罚则效力。</p>

                            <h3 className="font-bold text-base text-foreground">2. 领养流程与定金规则</h3>
                            <p>2.1. 您提交领养申请后，我们将与您确认订单细节与总价。</p>
                            <p>2.2. 订单细节确认无误后，您需要按照指引支付定金。定金支付成功，您的领养名额即被正式锁定，我们的约定正式生效。</p>
                            <p>2.3. <strong>重要：</strong>一旦定金支付完成，若您因个人原因单方面取消领养申请，无论订单是否已开始制作，您若已支付定金，则已支付的定金将不予退还。</p>

                            <h3 className="font-bold text-base text-foreground">3. 订单取消与违约责任</h3>
                            <p>3.1. <strong>制作开始前取消：</strong> 如上所述，若您在支付定金后、我们开始实质性制作（包括但不限于采购材料、设计版型等）前取消订单，您已支付的定金将不予退还。</p>
                            <p>3.2. <strong>制作开始后取消：</strong> 我们一旦开始实质性制作，订单将不可取消。 若您在此阶段执意单方面终止协议，将被视为严重违约。在此情况下：</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>您已支付的所有款项（包括定金及任何已付进度款）将不予退还，以弥补我们的材料成本、工时损失及机会成本。</li>
                                <li>我们有权单方面、任意处置已经部分或全部完成的产品（包括但不限于修改后转售、作为展示品或直接销毁），您无权对此提出任何异议或主张任何权利。</li>
                            </ul>

                            <h3 className="font-bold text-base text-foreground">4. 知识产权</h3>
                            <p>4.1. 我们是所有“设定”的唯一、永久的知识产权所有人。</p>
                            <p>4.2. 您的“领养”行为使您获得该设定的实体兽装所有权以及商业与非商业性使用权。您可以穿着兽装进行个人娱乐、参加线下活动、在社交媒体分享等。</p>
                            <p>4.3. 您有权利用该设定形象进行任何形式的商业活动（包括但不限于生产销售周边、用于广告、进行商业授权等）。</p>
                            <p>4.4 我们不建议您使用我们的产品从事色情行业或公开产生相关行为，一但因此造成不良后果，由您自行承担。</p>

                            <h3 className="font-bold text-base text-foreground">5. 争议解决</h3>
                            <p>5.1. <strong>沟通优先原则：</strong> 我们珍视每一位客户，并致力于提供优质的产品与服务。若在合作过程中出现任何问题或分歧，您同意首先通过我们官方的联系方式（如电子邮件、官方社交账号私信）与我们进行友好、理性的沟通，并给予我们合理的处理时间。</p>
                            <p>5.2. <strong>单方面行为的后果：</strong> 如果您在未与我们进行前述有效沟通的情况下，单方面在公开网络平台（如社交媒体、视频网站、论坛等）发布不实、夸大、诽谤或带有误导性的言论，损害我们的声誉，您将自行承担由此引发的一切法律后果。同时，我们保留中断服务、追究您法律责任的权利。</p>
                            <p>5.3. 若协商无法解决争议，双方同意将争议提交至本工作室所在地有管辖权的人民法院通过诉讼解决。</p>

                            <h3 className="font-bold text-base text-foreground">6. 其他</h3>
                            <p>6.1. 您承诺在申请过程中提供真实、准确的个人信息（如联系方式、邮寄地址、身体尺寸等），并对因信息错误造成的延误或损失负责。</p>
                            <p>6.2. 我们保留在法律允许范围内对本条款与条件进行解释和修改的权利。修改后的条款将在发布后立即生效。</p>

                            <p className="font-bold pt-4">提出订单申请即表示您已仔细阅读、完全理解并同意以上全部《前行无界工作室兽装领养条款与条件》。</p>
                        </div>
                    </ScrollArea>
                  </DialogContent>
              </Dialog>
            </div>
            <div className="text-center pt-4">
                <Button type="submit" size="lg" disabled={loading}>
                    {loading ? '提交中...' : '确认申请领养'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
